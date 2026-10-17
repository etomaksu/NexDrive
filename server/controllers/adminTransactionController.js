const Transaction = require('../models/Transaction')

const OFFSET_MS = 8 * 60 * 60 * 1000 // Manila = UTC+8

const TYPE_LABEL = {
  downpayment: 'Downpayment (50%)',
  balance: 'Balance (50%)',
}
const METHOD_LABEL = { cash: 'Cash', card: 'Card', gcash: 'GCash', maya: 'Maya' }

const cap = (s = '') => s.charAt(0).toUpperCase() + s.slice(1)
const fullName = (u) => (u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : '')

// Date as YYYY-MM-DD in Manila time
const manilaDate = (d) => new Date(new Date(d).getTime() + OFFSET_MS).toISOString().slice(0, 10)

// GET /api/admin/transactions
exports.listTransactions = async (req, res) => {
  try {
    const txns = await Transaction.find()
      .populate('customer', 'firstName lastName')
      .populate('reservation', 'ref')
      .sort({ createdAt: -1 })
      .lean()

    res.json(
      txns.map((t) => ({
        key: t._id,
        id: t.txnId || `TXN-${String(t._id).slice(-4).toUpperCase()}`,
        customer: fullName(t.customer) || 'Unknown',
        booking: t.reservation?.ref ? `#${t.reservation.ref}` : '—',
        type: TYPE_LABEL[t.type] || TYPE_LABEL.downpayment,
        method: METHOD_LABEL[t.method] || cap(t.method || ''),
        amount: t.amount,
        status: cap(t.status || 'pending'),
        // paid date if paid, otherwise when it was created (falls back to the id's timestamp)
        date: manilaDate(t.paidAt || t.createdAt || t._id.getTimestamp()),
      }))
    )
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Could not load transactions.' })
  }
}