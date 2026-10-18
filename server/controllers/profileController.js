const fs = require('fs')
const path = require('path')
const User = require('../models/User')
const { LICENSE_DIR } = require('../middleware/uploadLicense')

const SIDES = ['front', 'back']

const toDto = (u) => ({
  id: u._id,
  firstName: u.firstName || '',
  lastName: u.lastName || '',
  email: u.email || '',
  phone: u.phone || '',
  address: u.address || '',
  license: {
    status: u.licenseStatus || (u.licenseFiles && u.licenseFiles.front ? 'pending' : 'none'), // none | pending | verified | rejected
    front: Boolean(u.licenseFiles && u.licenseFiles.front),
    back: Boolean(u.licenseFiles && u.licenseFiles.back),
  },
})

const handleError = (res, err) => {
  if (err.code === 11000) return res.status(409).json({ message: 'That email is already in use.' })
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors)[0].message })
  console.error(err)
  return res.status(500).json({ message: 'Server error.' })
}

const removeFile = (name) => {
  if (name) fs.unlink(path.join(LICENSE_DIR, path.basename(name)), () => {})
}

// GET /api/profile
exports.getProfile = async (req, res) => {
  try {
    const u = await User.findById(req.user.id).lean()
    if (!u) return res.status(404).json({ message: 'Account not found.' })
    res.json(toDto(u))
  } catch (err) { handleError(res, err) }
}

// PUT /api/profile  { firstName, lastName, email, phone, address }
exports.updateProfile = async (req, res) => {
  try {
    const firstName = String(req.body.firstName || '').trim()
    const lastName = String(req.body.lastName || '').trim()
    const email = String(req.body.email || '').toLowerCase().trim()
    if (!firstName || !lastName) return res.status(400).json({ message: 'Enter your first and last name.' })
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email.' })

    const u = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, email, phone: String(req.body.phone || '').trim(), address: String(req.body.address || '').trim() },
      { new: true, runValidators: true }
    ).lean()
    if (!u) return res.status(404).json({ message: 'Account not found.' })
    res.json(toDto(u))
  } catch (err) { handleError(res, err) }
}

// POST /api/profile/license   multipart: front, back (JPG/PNG, 5 MB each)
// A new upload puts the license back to "pending" until staff verify it.
exports.uploadLicense = async (req, res) => {
  try {
    const files = req.files || {}
    if (!files.front && !files.back) return res.status(400).json({ message: 'Choose a license photo to upload.' })

    const before = await User.findById(req.user.id).lean()
    if (!before) return res.status(404).json({ message: 'Account not found.' })

    const set = { licenseStatus: 'pending' }
    for (const side of SIDES) if (files[side]) set[`licenseFiles.${side}`] = files[side][0].filename

    const u = await User.findByIdAndUpdate(req.user.id, { $set: set }, { new: true }).lean()
    for (const side of SIDES) if (files[side]) removeFile(before.licenseFiles && before.licenseFiles[side]) // drop the replaced photo
    res.json(toDto(u))
  } catch (err) { handleError(res, err) }
}

const sendLicense = async (userId, side, res) => {
  if (!SIDES.includes(side)) return res.status(400).json({ message: 'Use "front" or "back".' })
  const u = await User.findById(userId).lean()
  const name = u && u.licenseFiles && u.licenseFiles[side]
  if (!name) return res.status(404).json({ message: 'No license photo uploaded.' })
  res.sendFile(path.join(LICENSE_DIR, path.basename(name)))
}

// GET /api/profile/license/:side     (the customer's own photo)
exports.getMyLicenseFile = async (req, res) => {
  try { await sendLicense(req.user.id, req.params.side, res) } catch (err) { handleError(res, err) }
}

// GET /api/staff/customers/:id/license/:side     (staff + admin)
exports.getCustomerLicenseFile = async (req, res) => {
  try { await sendLicense(req.params.id, req.params.side, res) } catch (err) { handleError(res, err) }
}