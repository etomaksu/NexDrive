const Message = require('../models/Message')

// POST /api/messages   (public: used by the Contact us form, no login needed)
exports.createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Please fill in your name, email and message.' })
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email.' })
    }

    await Message.create({
      name,
      email,
      subject: subject?.trim() || undefined, // falls back to "General inquiry"
      message,
    })

    res.status(201).json({ message: 'Message sent' })
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors)[0].message })
    }
    console.error(err)
    res.status(500).json({ message: 'Server Error' })
  }
}