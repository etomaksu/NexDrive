// Seeds sample data for the admin pages.
//   node seed.js          -> adds sample users, backfills cars, adds reservations/transactions/messages
//                            (skips reservations/transactions/messages if reservations already exist)
//   node seed.js --reset  -> first DELETES all reservations, transactions and messages, then re-seeds
// Run it from the server folder. Your cars and existing user accounts are never deleted.

try { require('dotenv').config() } catch (_) { /* dotenv optional */ }

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
const Car = require('./models/Cars')
const Reservation = require('./models/Reservation')
const Transaction = require('./models/Transaction')
const Message = require('./models/Message')

const RESET = process.argv.includes('--reset')
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/NexDrive'

const DAY = 24 * 60 * 60 * 1000
const OFFSET_MS = 8 * 60 * 60 * 1000 // Manila = UTC+8
const NOW = new Date()
const mNow = new Date(NOW.getTime() + OFFSET_MS)
const Y = mNow.getUTCFullYear()
const M = mNow.getUTCMonth()
const TODAY = mNow.getUTCDate()

// Small deterministic random generator so every run produces the same data
let state = 42
const rand = () => (state = (state * 1664525 + 1013904223) % 4294967296) / 4294967296
const int = (a, b) => a + Math.floor(rand() * (b - a + 1))
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))

const SAMPLE_USERS = [
  { firstName: 'Maria', lastName: 'Santos', email: 'maria.santos@email.com', role: 'customer', phone: '09171110001' },
  { firstName: 'Juan', lastName: 'Dela Cruz', email: 'juan.dela.cruz@email.com', role: 'customer', phone: '09171110002' },
  { firstName: 'Ana', lastName: 'Reyes', email: 'ana.reyes@email.com', role: 'customer', phone: '09171110003' },
  { firstName: 'Paolo', lastName: 'Cruz', email: 'paolo.cruz@email.com', role: 'customer', phone: '09171110004' },
  { firstName: 'Ben', lastName: 'Torres', email: 'ben.torres@email.com', role: 'customer', phone: '09171110005' },
  { firstName: 'Liza', lastName: 'Ramos', email: 'liza@webname.ph', role: 'staff', phone: '09171110006' },
]
const ARCHIVED_USER = {
  firstName: 'Rico', lastName: 'Alvarez', email: 'rico.alvarez@email.com', role: 'customer', phone: '09171110007',
}

const LOCATIONS = ['Imus, Cavite', 'Dasmariñas, Cavite', 'Bacoor, Cavite', 'NAIA Terminal 3']
const METHODS = ['cash', 'card', 'gcash', 'maya']

async function seedUsers() {
  const password = await bcrypt.hash('Password123', 10)
  const adminOrStaff = await User.findOne({ role: { $in: ['admin', 'staff'] } })
  let created = 0

  for (const u of SAMPLE_USERS) {
    if (await User.findOne({ email: u.email })) continue
    await User.create({
      ...u,
      password,
      status: 'active',
      lastActiveAt: new Date(NOW.getTime() - int(0, 5) * DAY),
      ...(u.role === 'customer' && { licenseNumber: `N0${int(1, 9)}-2${int(0, 5)}-${int(100000, 999999)}`, licenseStatus: 'verified' }),
    })
    created++
  }

  if (!(await User.findOne({ email: ARCHIVED_USER.email }))) {
    await User.create({
      ...ARCHIVED_USER,
      password,
      status: 'inactive',
      lastActiveAt: new Date(NOW.getTime() - 60 * DAY),
      isArchived: true,
      archivedAt: new Date(NOW.getTime() - 20 * DAY),
      archivedBy: adminOrStaff?._id,
      archiveReason: 'Inactive',
    })
    created++
  }

  console.log(`Users: ${created} created (sample password: Password123)`)
}

async function backfillCars() {
  await Car.updateMany({ status: { $exists: false } }, { $set: { status: 'available' } })
  await Car.updateMany({ isArchived: { $exists: false } }, { $set: { isArchived: false } })

  const noPlate = await Car.find({ $or: [{ plate: { $exists: false } }, { plate: null }, { plate: '' }] })
  let n = 1001
  for (const car of noPlate) {
    // find an unused plate
    while (await Car.exists({ plate: `NEX ${n}` })) n++
    await Car.updateOne({ _id: car._id }, { $set: { plate: `NEX ${n}` } })
    n++
  }
  console.log(`Cars: backfilled status/archive flags, added ${noPlate.length} plates`)
}

async function seedBookings() {
  const existing = await Reservation.countDocuments()
  if (existing > 0 && !RESET) {
    console.log(`Reservations: ${existing} already exist, skipped (use --reset to wipe and re-seed)`)
    return
  }
  if (RESET) {
    await Promise.all([Reservation.deleteMany({}), Transaction.deleteMany({}), Message.deleteMany({})])
    console.log('Reset: cleared reservations, transactions and messages')
  }

  const cars = await Car.find({ isArchived: { $ne: true } }).lean()
  const customers = await User.find({ role: 'customer', isArchived: { $ne: true }, status: { $ne: 'blocked' } }).lean()
  const staff = await User.find({ role: { $in: ['staff', 'admin'] }, isArchived: { $ne: true } }).lean()

  if (!cars.length || !customers.length) {
    console.log('Skipped bookings: need at least one car and one customer.')
    return
  }
  const archiver = staff[0]

  // ---- Reservations: the last 12 months, growing over time -------------------
  const reservations = []
  for (let k = 11; k >= 0; k--) {
    const count = 8 + (11 - k) * 2 + int(0, 3)
    const monthStart = new Date(Date.UTC(Y, M - k, 1))
    const daysInMonth = new Date(Date.UTC(Y, M - k + 1, 0)).getUTCDate()
    const maxDay = k === 0 ? Math.min(daysInMonth, TODAY + 3) : daysInMonth

    for (let i = 0; i < count; i++) {
      const car = pick(cars)
      const customer = pick(customers)
      const days = int(1, 5)
      const pickupAt = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), int(1, maxDay), int(8, 17) - 8))
      const returnAt = new Date(pickupAt.getTime() + days * DAY)
      const createdAt = new Date(Math.min(NOW.getTime(), pickupAt.getTime() - int(1, 5) * DAY))
      const dailyRate = car.price || 2000

      let status
      if (returnAt < NOW) status = rand() < 0.1 ? 'cancelled' : rand() < 0.06 ? 'returned' : 'completed'
      else if (pickupAt <= NOW) status = 'active'
      else status = rand() < 0.6 ? 'approved' : 'requested'

      const handler = status === 'requested' ? undefined : pick(staff)?._id
      const history = [{ status: 'requested', at: createdAt }]
      if (status !== 'requested') history.push({ status: status === 'cancelled' ? 'cancelled' : 'approved', at: new Date(createdAt.getTime() + 3600000), by: handler })

      reservations.push(clean({
        _id: new mongoose.Types.ObjectId(),
        customer: customer._id,
        car: car._id,
        pickupAt,
        returnAt,
        pickupLocation: pick(LOCATIONS),
        days,
        dailyRate,
        totalAmount: days * dailyRate,
        status,
        handledBy: handler,
        statusHistory: history,
        isArchived: false,
        createdAt,
        updatedAt: createdAt,
        __v: 0,
      }))
    }
  }

  // Booking numbers in chronological order
  reservations.sort((a, b) => a.pickupAt - b.pickupAt)
  reservations.forEach((r, i) => { r.ref = `DE-${1001 + i}` })

  // Archive the two oldest completed bookings so the Archive page has something to show
  reservations
    .filter((r) => r.status === 'completed')
    .slice(0, 2)
    .forEach((r, i) => {
      r.isArchived = true
      r.archivedAt = new Date(NOW.getTime() - (30 + i * 15) * DAY)
      r.archivedBy = archiver?._id
      r.archiveReason = 'Completed'
      if (r.archivedBy === undefined) delete r.archivedBy
    })

  // ---- Transactions: 50% downpayment + 50% balance --------------------------
  const transactions = []
  let txn = 3001
  const addTxn = (r, type, status, paidAt) => {
    const createdAt = r.createdAt
    transactions.push(clean({
      _id: new mongoose.Types.ObjectId(),
      txnId: `TXN-${txn++}`,
      reservation: r._id,
      customer: r.customer,
      type,
      amount: Math.round(r.totalAmount / 2),
      method: pick(METHODS),
      status,
      paidAt,
      createdAt: paidAt || createdAt,
      updatedAt: paidAt || createdAt,
      __v: 0,
    }))
  }
  const before = (d) => new Date(Math.min(NOW.getTime(), d.getTime()))

  for (const r of reservations) {
    const downPaidAt = before(new Date(r.createdAt.getTime() + 2 * 3600000))
    if (r.status === 'requested') addTxn(r, 'downpayment', 'pending')
    else if (r.status === 'approved') addTxn(r, 'downpayment', 'paid', downPaidAt)
    else if (r.status === 'cancelled') addTxn(r, 'downpayment', rand() < 0.7 ? 'refunded' : 'paid', downPaidAt)
    else if (r.status === 'active') {
      addTxn(r, 'downpayment', 'paid', downPaidAt)
      addTxn(r, 'balance', 'pending')
    } else {
      // completed / returned
      addTxn(r, 'downpayment', 'paid', downPaidAt)
      addTxn(r, 'balance', 'paid', before(r.returnAt))
    }
  }

  // ---- Messages (as in the Figma design) ------------------------------------
  const ago = (h) => new Date(NOW.getTime() - h * 3600000)
  const replier = staff[0]?._id
  const msg = (name, email, subject, message, hours, replied) => clean({
    _id: new mongoose.Types.ObjectId(),
    name, email, subject, message,
    status: replied ? 'replied' : 'new',
    reply: replied ? 'Hi! Thanks for reaching out. We have noted your request and will confirm shortly.' : undefined,
    repliedAt: replied ? ago(hours - 2) : undefined,
    repliedBy: replied ? replier : undefined,
    createdAt: ago(hours),
    updatedAt: ago(hours),
    __v: 0,
  })
  const messages = [
    msg('Althea Lois Ramos', 'althea@email.com', 'Question about my Toyota Vios booking', "Can I extend my rental by one more day? I'm still in Batangas and my meeting got moved.", 3, false),
    msg('Juan Dela Cruz', 'juan@email.com', 'License verification', 'I uploaded my license yesterday. How long does verification usually take?', 72, false),
    msg('Maria Santos', 'maria@email.com', 'Pick-up time change', 'Can I pick up the Innova at 8:00 AM instead of 10:00 AM on Saturday?', 96, true),
    msg('Paolo Cruz', 'paolo@email.com', 'Refund for cancelled booking', 'I cancelled my Fortuner booking. When will the refund reach my card?', 120, true),
    msg('Ana Reyes', 'ana@email.com', 'Delivery to Dasmariñas', 'Do you offer delivery to Dasmariñas? And is there an extra fee?', 144, true),
  ]

  await Reservation.collection.insertMany(reservations)
  await Transaction.collection.insertMany(transactions)
  await Message.collection.insertMany(messages)

  console.log(`Reservations: ${reservations.length} created`)
  console.log(`Transactions: ${transactions.length} created`)
  console.log(`Messages: ${messages.length} created`)
}

async function main() {
  await mongoose.connect(MONGO_URI)
  console.log(`Connected to ${mongoose.connection.name}`)
  await Promise.all([Reservation.init(), Transaction.init(), Message.init()]) // create indexes
  await seedUsers()
  await backfillCars()
  await seedBookings()
  await mongoose.disconnect()
  console.log('Done.')
}

main().catch(async (err) => {
  console.error('Seed failed:', err.message)
  await mongoose.disconnect()
  process.exit(1)
})