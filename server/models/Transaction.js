const mongoose = require('mongoose')

const archiveFields = require('./archiveFields')
const TransactionSchema = new mongoose.Schema(
  {
    // Human-friendly ID shown in the admin table, e.g. TXN-3308 (auto-generated below)
    txnId: { type: String, unique: true, sparse: true },

    reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'userAccounts', required: true },

    // Every booking needs a 50% downpayment; the other 50% is the balance
    type: { type: String, enum: ['downpayment', 'balance'], default: 'downpayment' },

    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['cash', 'card', 'gcash', 'maya'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'refunded', 'failed'], default: 'pending' },

    paidAt: { type: Date },
    reference: { type: String, trim: true },
  },
  { timestamps: true }
)

// Generate the next TXN-#### id when one isn't given
TransactionSchema.pre('validate', async function () {
  if (this.txnId) return
  const last = await this.constructor
    .findOne({ txnId: /^TXN-\d+$/ })
    .sort({ createdAt: -1 })
    .select('txnId')
    .lean()
  const next = last ? parseInt(last.txnId.slice(4), 10) + 1 : 3001
  this.txnId = `TXN-${next}`
})

module.exports = mongoose.model('Transaction', TransactionSchema)