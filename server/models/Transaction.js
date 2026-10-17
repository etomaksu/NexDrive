const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema({
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
  customer:    { type: mongoose.Schema.Types.ObjectId, ref: 'userAccounts', required: true },
  amount:      { type: Number, required: true },
  method:      { type: String },                       // GCash, card, cash, etc.
  status:      { type: String, enum: ['pending', 'paid', 'refunded', 'failed'], default: 'pending' },
  paidAt:      { type: Date },
  reference:   { type: String }                        // payment gateway reference
}, { timestamps: true })

module.exports = mongoose.model('Transaction', TransactionSchema)