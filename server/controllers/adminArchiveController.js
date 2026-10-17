const Reservation = require('../models/Reservation')
const Car = require('../models/Cars')
const User = require('../models/User')

const OFFSET_MS = 8 * 60 * 60 * 1000 // Manila = UTC+8

const MODELS = {
  reservations: Reservation,
  vehicles: Car,
  users: User,
}

const cap = (s = '') => s.charAt(0).toUpperCase() + s.slice(1)
const fullName = (u) => (u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : '')

// Fields every archived row has, whatever the collection
const base = (d) => ({
  id: d._id,
  archivedOn: d.archivedAt || d.updatedAt || null,
  archivedBy: fullName(d.archivedBy) || 'System',
})

const whoFields = 'firstName lastName'

// GET /api/admin/archive
// -> { reservations: [...], vehicles: [...], users: [...], stats: { restoredThisMonth, activeRecords } }
exports.getArchive = async (req, res) => {
  try {
    const archived = { isArchived: true }

    // Start of this month in Manila, as a UTC instant
    const now = new Date(Date.now() + OFFSET_MS)
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) - OFFSET_MS)
    const restored = { restoredAt: { $gte: monthStart } }
    const active = { isArchived: { $ne: true } }

    const [reservations, vehicles, users, restoredCounts, activeCounts] = await Promise.all([
      Reservation.find(archived)
        .populate('car', 'name')
        .populate('customer', whoFields)
        .populate('archivedBy', whoFields)
        .sort({ archivedAt: -1 })
        .lean(),
      Car.find(archived).populate('archivedBy', whoFields).sort({ archivedAt: -1 }).lean(),
      User.find(archived).populate('archivedBy', whoFields).sort({ archivedAt: -1 }).lean(),
      Promise.all([Reservation, Car, User].map((M) => M.countDocuments(restored))),
      Promise.all([Reservation, Car, User].map((M) => M.countDocuments(active))),
    ])

    res.json({
      reservations: reservations.map((r) => ({
        ...base(r),
        record: `#${r.ref}`,
        details: `${r.car?.name || 'Unknown car'} · ${fullName(r.customer) || 'Unknown customer'}`,
        reason: r.archiveReason || cap(r.status),
      })),
      vehicles: vehicles.map((c) => ({
        ...base(c),
        record: c.plate || '—',
        details: c.name,
        reason: c.archiveReason || 'Archived',
      })),
      users: users.map((u) => ({
        ...base(u),
        record: `USR-${String(u._id).slice(-4).toUpperCase()}`,
        details: `${fullName(u)} · ${cap(u.role)}`,
        reason: u.archiveReason || 'Archived',
      })),
      stats: {
        restoredThisMonth: restoredCounts.reduce((a, b) => a + b, 0),
        activeRecords: activeCounts.reduce((a, b) => a + b, 0),
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Could not load the archive.' })
  }
}

// PATCH /api/admin/archive/:type/:id/restore
exports.restoreRecord = async (req, res) => {
  try {
    const Model = MODELS[req.params.type]
    if (!Model) return res.status(400).json({ message: 'Invalid record type.' })

    // updateOne (not save) so old documents missing newer required fields still restore
    const result = await Model.updateOne(
      { _id: req.params.id, isArchived: true },
      {
        $set: { isArchived: false, restoredAt: new Date() },
        $unset: { archivedAt: '', archivedBy: '', archiveReason: '' },
      }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Archived record not found.' })
    }
    res.json({ id: req.params.id, restored: true })
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id.' })
    console.error(err)
    res.status(500).json({ message: 'Could not restore the record.' })
  }
}