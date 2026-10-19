const Reservation = require('../models/Reservation')
const Car = require('../models/Cars')
const Transaction = require('../models/Transaction')

// reservations in these statuses keep the car blocked
const BLOCKING = ['requested', 'approved', 'active']
const DAY = 24 * 60 * 60 * 1000
const MANILA_OFFSET = 8 * 60 * 60 * 1000

// Add-ons and the service fee are priced here, on the server, so the total can't be edited in the browser.
// Change the names / prices to whatever you want to offer.
const ADDONS = [
  { id: 'child-seat', name: 'Child seat', description: 'Safe and comfortable for little passengers', pricePerDay: 150 },
  { id: 'gps', name: 'GPS navigation', description: 'Find your way around without data', pricePerDay: 100 },
  { id: 'roadside', name: 'Roadside assistance', description: '24/7 help if something goes wrong', pricePerDay: 120 },
]
const SERVICE_FEE = 300

// accepts "2026-10-20" or "2026-10-20T09:00" (Manila time)
const isWhen = (s) => /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(String(s))
const datePart = (s) => String(s).slice(0, 10)
const toDate = (s) => (String(s).length > 10 ? new Date(`${String(s).slice(0, 16)}:00+08:00`) : startOfDay(s))
const startOfDay = (s) => new Date(`${s}T00:00:00+08:00`)          // midnight in Manila
const endOfDay = (s) => new Date(`${s}T23:59:59.999+08:00`)
const manilaDate = (d) => new Date(new Date(d).getTime() + MANILA_OFFSET).toISOString().slice(0, 10)

// Overlap on whole days (the return day counts as booked, same as the calendar on the car page)
const overlapFilter = (carId, fromStr, toStr) => ({
  car: carId,
  status: { $in: BLOCKING },
  isArchived: { $ne: true },
  pickupAt: { $lte: endOfDay(toStr) },
  returnAt: { $gte: startOfDay(fromStr) },
})

// Next booking number: DE-1253, DE-1254, ...
const nextRef = async () => {
  const last = await Reservation.findOne({}, { ref: 1 }).sort({ ref: -1 }).lean()
  const n = last ? parseInt(String(last.ref).replace(/\D/g, ''), 10) || 1000 : 1000
  return `DE-${n + 1}`
}

// GET /api/reservations/availability/:carId
// -> { ranges: [{ from: '2026-10-14', to: '2026-10-19' }] }  (days already taken)
exports.getAvailability = async (req, res) => {
  try {
    const rows = await Reservation.find({
      car: req.params.carId,
      status: { $in: BLOCKING },
      isArchived: { $ne: true },
      returnAt: { $gte: startOfDay(manilaDate(new Date())) },
    }).select('pickupAt returnAt').lean()

    res.json({ ranges: rows.map((r) => ({ from: manilaDate(r.pickupAt), to: manilaDate(r.returnAt) })) })
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid car id' })
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// GET /api/reservations/options  -> { addons, serviceFee }
exports.getOptions = (req, res) => res.json({ addons: ADDONS, serviceFee: SERVICE_FEE })

// ---- booking + payment (nothing is saved until the customer pays) -----------

const PAY_METHODS = ['card', 'gcash', 'maya', 'bank']

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status }
}

// Validates a booking request and works out the price. Saves nothing.
// body: { carId, pickup, returnDate, pickupLocation, returnLocation, addons }
const buildBooking = async (body) => {
  const { carId, pickup, returnDate } = body

  if (!isWhen(pickup) || !isWhen(returnDate)) throw new HttpError(400, 'Choose a pick-up and return date.')
  const pickupDay = datePart(pickup)
  const returnDay = datePart(returnDate)
  if (pickupDay < manilaDate(new Date()) || (String(pickup).length > 10 && toDate(pickup) < new Date(Date.now() - 5 * 60 * 1000))) {
    throw new HttpError(400, "Pick-up can't be in the past.")
  }
  if (returnDay < pickupDay || toDate(returnDate) < toDate(pickup)) {
    throw new HttpError(400, 'Return must be after the pick-up.')
  }

  const car = await Car.findOne({ _id: carId, isArchived: { $ne: true } })
  if (!car) throw new HttpError(404, 'Car not found.')
  if (car.status === 'maintenance') {
    throw new HttpError(400, 'This car is under maintenance and can’t be booked right now.')
  }
  if (await Reservation.exists(overlapFilter(car._id, pickupDay, returnDay))) {
    throw new HttpError(409, 'Some of those days are already booked.')
  }

  // days between pick-up and return, at least 1 (same as the existing bookings)
  const days = Math.max(1, Math.round((startOfDay(returnDay) - startOfDay(pickupDay)) / DAY))
  const chosen = ADDONS.filter((a) => (body.addons || []).includes(a.id))
  const rentalTotal = days * car.price
  const addonsTotal = chosen.reduce((sum, a) => sum + a.pricePerDay, 0) * days
  const total = rentalTotal + addonsTotal + SERVICE_FEE
  const downpayment = Math.round(total / 2)

  return { car, pickup, returnDate, days, chosen, rentalTotal, addonsTotal, total, downpayment, balance: total - downpayment }
}

const quoteDto = (b) => ({
  carName: b.car.name,
  days: b.days,
  rentalTotal: b.rentalTotal,
  addonsTotal: b.addonsTotal,
  serviceFee: SERVICE_FEE,
  total: b.total,
  downpayment: b.downpayment,
  balance: b.balance,
})

const sendError = (err, res) => {
  if (err instanceof HttpError) return res.status(err.status).json({ message: err.message })
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid car id' })
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message })
  console.error(err)
  res.status(500).json({ message: 'Server error.' })
}

// POST /api/reservations/quote   (same body as checkout, without option / method)
// -> price breakdown for the payment page. Nothing is saved.
exports.quoteBooking = async (req, res) => {
  try {
    res.json(quoteDto(await buildBooking(req.body)))
  } catch (err) { sendError(err, res) }
}

// POST /api/reservations/checkout
// { carId, pickup, returnDate, pickupLocation, returnLocation, addons, option: 'down' | 'full', method }
// Creates the booking AND records its payment in one step.
// NOTE: there is no real payment gateway yet, so the payment is recorded as paid right away.
// Card details are never sent to the server.
exports.checkout = async (req, res) => {
  try {
    const { option, method, pickupLocation, returnLocation } = req.body
    if (!['down', 'full'].includes(option)) throw new HttpError(400, 'Choose a payment option.')
    if (!PAY_METHODS.includes(method)) throw new HttpError(400, 'Choose a payment method.')

    const b = await buildBooking(req.body) // re-checks dates and availability right before paying

    let reservation
    for (let attempt = 0; attempt < 3 && !reservation; attempt++) {
      try {
        reservation = await Reservation.create({
          ref: await nextRef(),
          customer: req.user.id,
          car: b.car._id,
          pickupAt: toDate(b.pickup),
          returnAt: toDate(b.returnDate),
          pickupLocation,
          returnLocation,
          days: b.days,
          dailyRate: b.car.price,
          addons: b.chosen.map(({ id, name, pricePerDay }) => ({ id, name, pricePerDay })),
          serviceFee: SERVICE_FEE,
          totalAmount: b.total,
          status: 'requested',
          statusHistory: [{ status: 'requested', at: new Date(), by: req.user.id }],
        })
      } catch (err) {
        if (err.code !== 11000 || attempt === 2) throw err // someone took that number, try the next one
      }
    }

    let txn
    try {
      for (let attempt = 0; attempt < 3 && !txn; attempt++) {
        try {
          txn = await Transaction.create({
            reservation: reservation._id,
            customer: req.user.id,
            type: option === 'full' ? 'full' : 'downpayment',
            amount: option === 'full' ? b.total : b.downpayment,
            method,
            status: 'paid',
            paidAt: new Date(),
            reference: `${reservation.ref}-${Date.now().toString(36).toUpperCase()}`,
          })
        } catch (err) {
          if (err.code !== 11000 || attempt === 2) throw err // txn number taken, try the next one
        }
      }
    } catch (err) {
      await Reservation.deleteOne({ _id: reservation._id }) // never leave a booking without its payment
      throw err
    }

    const paidAmount = txn.amount
    res.status(201).json({
      id: reservation._id,
      ref: reservation.ref,
      txnId: txn.txnId,
      method: txn.method,
      type: txn.type,
      paidAt: txn.paidAt,
      amount: paidAmount,
      // everything the receipt shows
      carName: b.car.name,
      pickupAt: toDate(b.pickup).toISOString(),
      returnAt: toDate(b.returnDate).toISOString(),
      pickupLocation,
      returnLocation,
      days: b.days,
      price: b.car.price,
      rentalTotal: b.rentalTotal,
      addonsTotal: b.addonsTotal,
      serviceFee: SERVICE_FEE,
      total: b.total,
      paidAmount,
      balance: b.total - paidAmount,
    })
  } catch (err) { sendError(err, res) }
}

// ---- customer dashboard ------------------------------------------------------
// Note: customers also see their archived bookings (staff archive completed ones, but they are still the customer's history).

const STATUS_LABEL = {
  requested: 'Pending', approved: 'Confirmed', active: 'Active',
  returned: 'Completed', completed: 'Completed', rejected: 'Declined', cancelled: 'Cancelled',
}
const UPCOMING = ['requested', 'approved', 'active']
const CHANGEABLE = ['requested', 'approved']   // can still be cancelled / rescheduled (until pick-up)

const carOf = (c) => (c ? { id: c._id, name: c.name, imageUrl: c.imageUrl, imageKey: c.imageKey } : null)
const canChange = (r) => CHANGEABLE.includes(r.status) && new Date(r.pickupAt) > new Date()

const bookingDto = (r) => ({
  id: r._id,
  code: r.ref,
  car: carOf(r.car),
  carName: r.car ? r.car.name : 'Car',
  pickupAt: r.pickupAt,
  returnAt: r.returnAt,
  location: r.pickupLocation || '',
  returnLocation: r.returnLocation || r.pickupLocation || '',
  status: STATUS_LABEL[r.status] || r.status,
  rawStatus: r.status,
  days: r.days,
  total: r.totalAmount,
  canCancel: canChange(r),
  canReschedule: canChange(r),
})

const myBooking = (id, userId) =>
  Reservation.findOne({ _id: id, customer: userId }).populate('car', 'name imageUrl imageKey')

// GET /api/reservations/mine   (the logged-in customer's bookings, newest first)
// Everything the dashboard, "My bookings" and the receipt need.
exports.listMine = async (req, res) => {
  try {
    const rows = await Reservation.find({ customer: req.user.id, isArchived: { $ne: true } })
      .populate('car', 'name plate imageUrl imageKey')
      .sort({ createdAt: -1 })
      .lean()

    const txns = await Transaction.find({
      reservation: { $in: rows.map((r) => r._id) },
      status: 'paid',
      type: { $in: ['downpayment', 'full', 'balance'] },
    }).sort({ paidAt: 1 }).lean()

    const paidBy = {}
    for (const t of txns) {
      const k = String(t.reservation)
      paidBy[k] = paidBy[k] || { amount: 0, method: t.method, txnId: t.txnId, paidAt: t.paidAt, type: t.type }
      paidBy[k].amount += t.amount
    }

    res.json(rows.map((r) => {
      const paid = paidBy[String(r._id)]
      const addonsTotal = (r.addons || []).reduce((sum, a) => sum + a.pricePerDay, 0) * r.days
      return {
        id: r._id,
        ref: r.ref,
        status: r.status,
        createdAt: r.createdAt,
        car: r.car ? { id: r.car._id, name: r.car.name, plate: r.car.plate, imageUrl: r.car.imageUrl, imageKey: r.car.imageKey } : null,
        pickupAt: r.pickupAt,
        returnAt: r.returnAt,
        pickupLocation: r.pickupLocation,
        returnLocation: r.returnLocation,
        days: r.days,
        price: r.dailyRate,
        rentalTotal: r.days * r.dailyRate,
        addonsTotal,
        serviceFee: r.serviceFee || 0,
        total: r.totalAmount,
        history: (r.statusHistory || []).map((h) => ({ status: h.status, at: h.at })),
        paidAmount: paid ? paid.amount : 0,
        paidType: paid ? paid.type : null,
        method: paid ? paid.method : null,
        txnId: paid ? paid.txnId : null,
        paidAt: paid ? paid.paidAt : null,
      }
    }))
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// PATCH /api/reservations/:id/cancel   (customers can cancel their own booking until the keys are handed over)
exports.cancelReservation = async (req, res) => {
  try {
    const r = await Reservation.findOne({ _id: req.params.id, customer: req.user.id, isArchived: { $ne: true } })
    if (!r) return res.status(404).json({ message: 'Booking not found.' })
    if (!['requested', 'approved'].includes(r.status)) {
      return res.status(400).json({ message: `A ${r.status} booking can't be cancelled.` })
    }
    r.status = 'cancelled'
    r.statusHistory.push({ status: 'cancelled', at: new Date(), by: req.user.id })
    await r.save()
    res.json({ id: r._id, status: r.status })
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid booking id' })
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}