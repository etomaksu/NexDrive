const Reservation = require('../models/Reservation')
const Car = require('../models/Cars')

// what a reservation may move to from each status
const NEXT = {
  requested: ['approved', 'rejected'],
  approved:  ['active', 'cancelled'],
  active:    ['returned'],
  returned:  ['completed'],
}

const fullName = (u) => (u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'Unknown')

const toDto = (r) => ({
  id: r._id,
  ref: r.ref,
  customer: fullName(r.customer),
  car: r.car ? r.car.name : 'Unknown car',
  pickupAt: r.pickupAt,
  returnAt: r.returnAt,
  total: r.totalAmount,
  status: r.status,
  plate: r.car ? r.car.plate : '',
  branch: r.pickupLocation || 'Main branch',
  readyForPickup: Boolean(r.readyForPickup),
})

// GET /api/staff/reservations   (staff + admin)
exports.listReservations = async (req, res) => {
  try {
    const rows = await Reservation.find({ isArchived: { $ne: true } })
      .populate('customer', 'firstName lastName')
      .populate('car', 'name plate')
      .sort({ createdAt: -1 })
      .lean()
    res.json(rows.map(toDto))
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// PATCH /api/staff/reservations/:id/status   { status }
exports.setReservationStatus = async (req, res) => {
  try {
    const { status, message, reason, note } = req.body
    const r = await Reservation.findOne({ _id: req.params.id, isArchived: { $ne: true } })
    if (!r) return res.status(404).json({ message: 'Reservation not found' })

    if (!(NEXT[r.status] || []).includes(status)) {
      return res.status(400).json({ message: `Cannot change a ${r.status} reservation to ${status}` })
    }

    if (status === 'rejected' && !String(reason || '').trim()) {
      return res.status(400).json({ message: 'Choose a reason for declining.' })
    }

    r.status = status
    if (status === 'approved' && message) r.staffMessage = String(message).trim().slice(0, 500)
    if (status === 'rejected') {
      r.declineReason = String(reason).trim().slice(0, 100)
      r.declineNote = String(note || '').trim().slice(0, 500)
    }
    r.handledBy = req.user.id
    r.statusHistory.push({ status, at: new Date(), by: req.user.id })

    // a completed rental is finished, so it moves straight to the Archive
    // (Reports still count it: they filter by status, not by isArchived)
    if (status === 'completed') {
      r.isArchived = true
      r.archivedAt = new Date()
      r.archivedBy = req.user.id
      r.archiveReason = 'Completed'
    }
    await r.save()

    // keep the car's status in step with the rental
    if (status === 'active') await Car.updateOne({ _id: r.car }, { status: 'rented' })
    if (status === 'returned') await Car.updateOne({ _id: r.car }, { status: 'available' })

    const full = await Reservation.findById(r._id)
      .populate('customer', 'firstName lastName').populate('car', 'name plate').lean()
    res.json(toDto(full))
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id' })
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// PATCH /api/staff/reservations/:id/ready   (approved only) -> vehicle is prepared for pick-up
exports.markReady = async (req, res) => {
  try {
    const r = await Reservation.findOneAndUpdate(
      { _id: req.params.id, status: 'approved', isArchived: { $ne: true } },
      { readyForPickup: true, readyAt: new Date() },
      { new: true }
    ).populate('customer', 'firstName lastName').populate('car', 'name plate').lean()
    if (!r) return res.status(404).json({ message: 'Reservation not found or not approved' })
    res.json(toDto(r))
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id' })
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// PATCH /api/staff/reservations/:id/archive   (returned/completed only)
exports.archiveReservation = async (req, res) => {
  try {
    const r = await Reservation.findOneAndUpdate(
      { _id: req.params.id, isArchived: { $ne: true }, status: { $in: ['returned', 'completed', 'rejected', 'cancelled'] } },
      { isArchived: true, archivedAt: new Date(), archivedBy: req.user.id, archiveReason: 'Archived by staff' },
      { new: true }
    )
    if (!r) return res.status(404).json({ message: 'Reservation not found or still in progress' })
    res.json({ id: r._id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}