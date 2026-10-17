const Reservation = require('../models/Reservation')
const Transaction = require('../models/Transaction')
const Car = require('../models/Cars')

// Reservations that count as real bookings (not requested / rejected / cancelled)
const COUNTED = ['approved', 'active', 'returned', 'completed']

const MANILA = 'Asia/Manila'
const OFFSET_MS = 8 * 60 * 60 * 1000
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const monthKey = (field) => ({
  $dateToString: { format: '%Y-%m', date: field, timezone: MANILA },
})

// GET /api/admin/reports
// Returns the last 12 months (oldest first) plus rentals per car per month.
// The frontend sums whatever period the admin picks.
exports.getReports = async (req, res) => {
  try {
    const now = new Date(Date.now() + OFFSET_MS) // "now" in Manila
    const y = now.getUTCFullYear()
    const m = now.getUTCMonth()

    // Build the 12 month skeleton so months without data show as 0
    const months = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(y, m - i, 1))
      months.push({
        key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`,
        label: MONTH_NAMES[d.getUTCMonth()],
        bookings: 0,
        revenue: 0,
        avgDays: 0,
      })
    }

    // Start of the oldest month / end of the current month, as Manila midnight
    const start = new Date(Date.UTC(y, m - 11, 1) - OFFSET_MS)
    const end = new Date(Date.UTC(y, m + 1, 1) - OFFSET_MS)

    const [bookingRows, revenueRows, carRows] = await Promise.all([
      Reservation.aggregate([
        { $match: { status: { $in: COUNTED }, pickupAt: { $gte: start, $lt: end } } },
        { $group: { _id: monthKey('$pickupAt'), bookings: { $sum: 1 }, avgDays: { $avg: '$days' } } },
      ]),
      Transaction.aggregate([
        { $match: { status: 'paid', paidAt: { $gte: start, $lt: end } } },
        { $group: { _id: monthKey('$paidAt'), revenue: { $sum: '$amount' } } },
      ]),
      Reservation.aggregate([
        { $match: { status: { $in: COUNTED }, pickupAt: { $gte: start, $lt: end } } },
        { $group: { _id: { month: monthKey('$pickupAt'), car: '$car' }, rentals: { $sum: 1 } } },
        { $lookup: { from: Car.collection.name, localField: '_id.car', foreignField: '_id', as: 'car' } },
        { $unwind: '$car' },
        { $project: { _id: 0, month: '$_id.month', name: '$car.name', rentals: 1 } },
      ]),
    ])

    const byKey = Object.fromEntries(months.map((mo) => [mo.key, mo]))
    bookingRows.forEach((r) => {
      if (!byKey[r._id]) return
      byKey[r._id].bookings = r.bookings
      byKey[r._id].avgDays = Math.round((r.avgDays || 0) * 100) / 100
    })
    revenueRows.forEach((r) => {
      if (byKey[r._id]) byKey[r._id].revenue = r.revenue
    })

    res.json({ months, cars: carRows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Could not load reports.' })
  }
}