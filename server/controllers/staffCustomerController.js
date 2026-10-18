const User = require('../models/User')
const Reservation = require('../models/Reservation')

const LICENSE = ['pending', 'verified', 'rejected']

// licenseFiles is stored as { front, back } (see profileController.uploadLicense)
const toDto = (u, bookings) => ({
  id: u._id,
  name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
  email: u.email,
  license: u.licenseStatus || 'none',
  hasLicense: Boolean(u.licenseFiles && u.licenseFiles.front),
  hasBack: Boolean(u.licenseFiles && u.licenseFiles.back),
  bookings: bookings[String(u._id)] || 0,
  account: u.status || 'active',
})

// GET /api/staff/customers
exports.listCustomers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer', isArchived: { $ne: true } })
      .sort({ firstName: 1 })
      .lean()
    const counts = await Reservation.aggregate([{ $group: { _id: '$customer', n: { $sum: 1 } } }])
    const bookings = Object.fromEntries(counts.map((c) => [String(c._id), c.n]))
    res.json(users.map((u) => toDto(u, bookings)))
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

const update = (field, allowed) => async (req, res) => {
  try {
    const value = req.body[field === 'licenseStatus' ? 'license' : 'status']
    if (!allowed.includes(value)) return res.status(400).json({ message: 'Invalid value' })

    const u = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'customer', isArchived: { $ne: true } },
      { [field]: value },
      { new: true }
    ).lean()
    if (!u) return res.status(404).json({ message: 'Customer not found' })

    const n = await Reservation.countDocuments({ customer: u._id })
    res.json(toDto(u, { [String(u._id)]: n }))
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id' })
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// PATCH /api/staff/customers/:id/license  { license: 'verified' | 'rejected' | 'pending' }
exports.setLicense = update('licenseStatus', LICENSE)
// PATCH /api/staff/customers/:id/status   { status: 'active' | 'blocked' }
exports.setAccountStatus = update('status', ['active', 'blocked'])

// The license photos are served by profileController.getCustomerLicenseFile
// (GET /api/staff/customers/:id/license/:side), so nothing else is needed here.