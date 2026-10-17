const jwt = require('jsonwebtoken')
const User = require('../models/User')

// checks the token and loads the current user
const protect = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not logged in' })
  }

  try {
    const token = header.split(' ')[1]
    // must be the same secret your loginUser uses in jwt.sign
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me')

    // read the role from the database, so role changes and blocks apply immediately
    const user = await User.findById(decoded.id).select('role status isArchived')
    if (!user || user.isArchived || user.status === 'blocked') {
      return res.status(401).json({ message: 'Account unavailable' })
    }

    req.user = { id: user._id.toString(), role: user.role }
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// allows only the listed roles, e.g. requireRole('admin') or requireRole('staff', 'admin')
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' })
  }
  next()
}

module.exports = { protect, requireRole }