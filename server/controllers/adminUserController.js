const bcrypt = require('bcryptjs')
const User = require('../models/User')

const ASSIGNABLE_ROLES = ['staff', 'admin']

const splitName = (full = '') => {
  const parts = String(full).trim().split(/\s+/).filter(Boolean)
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') }
}

const toDto = (u, selfId) => ({
  id: u._id,
  name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
  email: u.email,
  role: u.role,
  status: u.status || 'active',
  lastActiveAt: u.lastActiveAt || null,
  isSelf: String(u._id) === String(selfId),
})

const handleError = (res, err) => {
  if (err.code === 11000) return res.status(409).json({ message: 'That email is already in use.' })
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors)[0].message })
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid user id.' })
  console.error(err)
  return res.status(500).json({ message: 'Server error.' })
}

const findActive = (id) => User.findOne({ _id: id, isArchived: { $ne: true } })
const isSelf = (req, user) => String(user._id) === String(req.user.id)

// GET /api/admin/users
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({ isArchived: { $ne: true } })
      .sort({ firstName: 1 })
      .lean()
    res.json(users.map((u) => toDto(u, req.user.id)))
  } catch (err) {
    handleError(res, err)
  }
}

// POST /api/admin/users  { name, email, role, password }
exports.createUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body
    const { firstName, lastName } = splitName(name)

    if (!firstName || !lastName) return res.status(400).json({ message: 'Enter first and last name.' })
    if (!email) return res.status(400).json({ message: 'Email is required.' })
    if (!ASSIGNABLE_ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role.' })
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' })
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({
      firstName,
      lastName,
      email: String(email).toLowerCase().trim(),
      password: hash,
      role,
      status: 'active',
    })
    res.status(201).json(toDto(user, req.user.id))
  } catch (err) {
    handleError(res, err)
  }
}

// PUT /api/admin/users/:id  { name, email, role }
exports.updateUser = async (req, res) => {
  try {
    const user = await findActive(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found.' })

    const { name, email, role } = req.body

    if (name !== undefined) {
      const { firstName, lastName } = splitName(name)
      if (!firstName || !lastName) return res.status(400).json({ message: 'Enter first and last name.' })
      user.firstName = firstName
      user.lastName = lastName
    }

    if (email !== undefined) user.email = String(email).toLowerCase().trim()

    if (role !== undefined && role !== user.role) {
      if (user.role === 'customer' || isSelf(req, user)) {
        return res.status(400).json({ message: "This user's role can't be changed." })
      }
      if (!ASSIGNABLE_ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role.' })
      user.role = role
    }

    await user.save()
    res.json(toDto(user, req.user.id))
  } catch (err) {
    handleError(res, err)
  }
}

// PATCH /api/admin/users/:id/status  { status: 'active' | 'blocked' }
exports.setUserStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' })
    }

    const user = await findActive(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found.' })
    if (isSelf(req, user)) return res.status(400).json({ message: "You can't block your own account." })

    user.status = status
    await user.save()
    res.json(toDto(user, req.user.id))
  } catch (err) {
    handleError(res, err)
  }
}

// PATCH /api/admin/users/:id/archive  { reason? }
exports.archiveUser = async (req, res) => {
  try {
    const user = await findActive(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found.' })
    if (isSelf(req, user)) return res.status(400).json({ message: "You can't archive your own account." })

    user.isArchived = true
    user.archivedAt = new Date()
    user.archivedBy = req.user.id
    user.archiveReason = req.body.reason || 'Archived'
    await user.save()
    res.json({ id: user._id, archived: true })
  } catch (err) {
    handleError(res, err)
  }
}