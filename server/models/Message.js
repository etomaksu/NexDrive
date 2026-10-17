const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
    subject: { type: String, trim: true, maxlength: 150, default: 'General inquiry' },
    message: { type: String, required: true, trim: true, maxlength: 2000 },

    status: { type: String, enum: ['new', 'read', 'replied'], default: 'new', index: true },

    // Filled in when an admin/staff member replies
    reply: { type: String, trim: true },
    repliedAt: { type: Date },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'userAccounts' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Message', MessageSchema)