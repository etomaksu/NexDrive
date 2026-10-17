const mongoose = require('mongoose')

module.exports = {
  isArchived:    { type: Boolean, default: false, index: true },
  archivedAt:    { type: Date },
  archivedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'userAccounts' },
  archiveReason: { type: String, trim: true },
  restoredAt:    { type: Date },
}