const Message = require('../models/Message')

const cap = (s = '') => s.charAt(0).toUpperCase() + s.slice(1)

const toDto = (m) => ({
  id: m._id,
  name: m.name,
  email: m.email,
  subject: m.subject || 'General inquiry',
  message: m.message,
  received: m.createdAt || m._id.getTimestamp(),
  status: cap(m.status), // New | Read | Replied
  reply: m.reply || '',
})

const handleError = (res, err) => {
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid message id.' })
  console.error(err)
  return res.status(500).json({ message: 'Server error.' })
}

// GET /api/admin/messages
exports.listMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).lean()
    res.json(messages.map(toDto))
  } catch (err) {
    handleError(res, err)
  }
}

// GET /api/admin/messages/unread-count   (for the sidebar badge)
exports.unreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ status: 'new' })
    res.json({ count })
  } catch (err) {
    handleError(res, err)
  }
}

// PATCH /api/admin/messages/:id/read
exports.markRead = async (req, res) => {
  try {
    // Only flips new -> read; a replied message stays replied
    await Message.updateOne({ _id: req.params.id, status: 'new' }, { status: 'read' })
    res.json({ ok: true })
  } catch (err) {
    handleError(res, err)
  }
}

// POST /api/admin/messages/:id/reply  { reply }
exports.replyToMessage = async (req, res) => {
  try {
    const reply = String(req.body.reply || '').trim()
    if (!reply) return res.status(400).json({ message: 'Write a reply first.' })

    const msg = await Message.findById(req.params.id)
    if (!msg) return res.status(404).json({ message: 'Message not found.' })
    if (msg.status === 'replied') {
      return res.status(409).json({ message: 'This message has already been replied to.' })
    }

    msg.reply = reply
    msg.status = 'replied'
    msg.repliedAt = new Date()
    msg.repliedBy = req.user.id
    await msg.save()

    // NOTE: the reply is saved, but no email is sent yet.
    // To actually email the customer, send it here with nodemailer
    // (to: msg.email, subject: `Re: ${msg.subject}`, text: reply).

    res.json(toDto(msg))
  } catch (err) {
    handleError(res, err)
  }
}