const bcrypt = require('bcryptjs')
const User = require('../models/User')

const ROLES = ['customer', 'staff', 'admin']
const STATUSES = ['active', 'inactive', 'blocked']

const notArchived = { isArchived: { $ne: true } }

// "Juan Dela Cruz" -> { firstName: "Juan", lastName: "Dela Cruz" }
const splitName = (full = '') => {
  const parts = full.trim().split(/\s+/)
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') }
}

const shape = (u, myId) => ({
  id: u._id,
  name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
  email: u.email,
  role: u.role,
  status: u.status || 'active', // old docs have no status yet
  lastActiveAt: u.lastActiveAt || null,
  isSelf: String(u._id) === String(myId),
})

const handleError = (res, err) => {
  if (err.code === 11000) return res.status(409).json({ message: 'That email is already used' })
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message })
  console.error(err)
  return res.status(500).json({ message: 'Server error' })
}

// GET /api/admin/users
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find(notArchived).sort({ createdAt: -1 })
    res.json(users.map((u) => shape(u, req.user.id)))
  } catch (err) {
    handleError(res, err)
  }
}

// POST /api/admin/users   { name, email, password, role }
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    if (!name?.trim() || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }
    if (!['staff', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be staff or admin' })
    }

    const user = await User.create({
      ...splitName(name),
      email: email.trim().toLowerCase(),
      password: await bcrypt.hash(password, 10), // remove this hash if your User model hashes in a pre-save hook
      role,
      status: 'active',
    })
    res.status(201).json(shape(user, req.user.id))
  } catch (err) {
    handleError(res, err)
  }
}

// PUT /api/admin/users/:id   { name, email, role }
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body
    const update = {}

    if (name !== undefined) Object.assign(update, splitName(name))
    if (email !== undefined) update.email = email.trim().toLowerCase()
    if (role !== undefined) {
      if (!ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' })
      if (String(req.params.id) === String(req.user.id)) {
        return res.status(400).json({ message: "You can't change your own role" })
      }
      update.role = role
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, ...notArchived },
      update,
      { new: true, runValidators: true }
    )
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(shape(user, req.user.id))
  } catch (err) {
    handleError(res, err)
  }
}

// PATCH /api/admin/users/:id/status   { status: 'active' | 'blocked' | 'inactive' }
exports.setUserStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' })
    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({ message: "You can't change your own status" })
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, ...notArchived },
      { status },
      { new: true }
    )
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(shape(user, req.user.id))
  } catch (err) {
    handleError(res, err)
  }
}

// PATCH /api/admin/users/:id/archive
exports.archiveUser = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({ message: "You can't archive your own account" })
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, ...notArchived },
      {
        isArchived: true,
        archivedAt: new Date(),
        archivedBy: req.user.id,
        archiveReason: req.body?.reason || 'Archived',
      },
      { new: true }
    )
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ ok: true })
  } catch (err) {
    handleError(res, err)
  }
}