const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema(
  {
    // Human-friendly ID shown in the admin table, e.g. TXN-3308 (auto-generated below)
    txnId: { type: String, unique: true, sparse: true },

    reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'userAccounts', required: true },

    // Every booking needs a 50% downpayment; the other 50% is the balance
    type: { type: String, enum: ['downpayment', 'balance', 'full'], default: 'downpayment' },

    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['cash', 'card', 'gcash', 'maya', 'bank'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'refunded', 'failed'], default: 'pending' },

    paidAt: { type: Date },
    reference: { type: String, trim: true },
  },
  { timestamps: true }
)

// Generate the next TXN-#### id when one isn't given.
// Uses the highest number in use (not the newest record), because seeded transactions have back-dated createdAt.
TransactionSchema.pre('validate', async function () {
  if (this.txnId) return
  const [top] = await this.constructor.aggregate([
    { $match: { txnId: /^TXN-\d+$/ } },
    { $project: { n: { $toInt: { $substrCP: ['$txnId', 4, 20] } } } },
    { $group: { _id: null, max: { $max: '$n' } } },
  ])
  this.txnId = `TXN-${top ? top.max + 1 : 3001}`
})

module.exports = mongoose.model('Transaction', TransactionSchema)