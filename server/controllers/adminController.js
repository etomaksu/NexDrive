const Reservation = require('../models/Reservation')
const Transaction = require('../models/Transaction')
const Car = require('../models/Cars')
const User = require('../models/User')

const percentChange = (current, previous) =>
  previous === 0 ? null : Math.round(((current - previous) / previous) * 100)

const toCounts = (rows) => rows.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {})

const getDashboard = async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)

    const notArchived = { isArchived: { $ne: true } }
    const byStatus = { $group: { _id: '$status', count: { $sum: 1 } } }

    const [
      reservationRows, carRows, totalReservations, thisMonth, lastMonth,
      returningToday, revenueRows, recent,
      archivedReservations, archivedCars, archivedUsers,
    ] = await Promise.all([
      Reservation.aggregate([{ $match: notArchived }, byStatus]),
      Car.aggregate([{ $match: notArchived }, byStatus]),
      Reservation.countDocuments(),
      Reservation.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Reservation.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } }),
      Reservation.countDocuments({ status: 'active', returnAt: { $gte: startOfToday, $lt: endOfToday } }),
      Transaction.aggregate([
        { $match: { status: 'paid', paidAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              y: { $year: { date: '$paidAt', timezone: 'Asia/Manila' } },
              m: { $month: { date: '$paidAt', timezone: 'Asia/Manila' } },
            },
            total: { $sum: '$amount' },
          },
        },
      ]),
      Reservation.find(notArchived)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('customer', 'firstName lastName')
        .populate('car', 'name'),
      Reservation.countDocuments({ isArchived: true }),
      Car.countDocuments({ isArchived: true }),
      User.countDocuments({ isArchived: true }),
    ])

    // revenue for the last 6 months, oldest first
    const totalFor = (y, m) =>
      (revenueRows.find((r) => r._id.y === y && r._id.m === m) || { total: 0 }).total

    const revenue = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      revenue.push({
        month: d.toLocaleString('en-US', { month: 'short' }),
        value: Math.round(totalFor(d.getFullYear(), d.getMonth() + 1) / 1000), // in thousands
      })
    }

    const revenueThisMonth = totalFor(now.getFullYear(), now.getMonth() + 1)
    const lastD = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const revenueLastMonth = totalFor(lastD.getFullYear(), lastD.getMonth() + 1)

    const r = toCounts(reservationRows)
    const c = toCounts(carRows)
    const fleetTotal = (c.available || 0) + (c.rented || 0) + (c.maintenance || 0)

    res.json({
      stats: {
        totalReservations,
        reservationGrowth: percentChange(thisMonth, lastMonth),
        revenue: revenueThisMonth,
        revenueGrowth: percentChange(revenueThisMonth, revenueLastMonth),
        activeRentals: r.active || 0,
        returningToday,
      },
      pipeline: {
        requested: r.requested || 0,
        approved: r.approved || 0,
        active: r.active || 0,
        returned: r.returned || 0,
        completed: r.completed || 0,
      },
      fleet: {
        available: c.available || 0,
        rented: c.rented || 0,
        maintenance: c.maintenance || 0,
        total: fleetTotal,
      },
      revenue,
      recent: recent.map((x) => ({
        id: x._id,
        ref: x.ref,
        customer: x.customer ? `${x.customer.firstName} ${x.customer.lastName}` : 'Unknown',
        vehicle: x.car ? x.car.name : 'Unknown',
        pickupAt: x.pickupAt,
        returnAt: x.returnAt,
        status: x.status,
      })),
      archive: {
        reservations: archivedReservations,
        vehicles: archivedCars,
        users: archivedUsers,
      },
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Server Error' })
  }
}

module.exports = { getDashboard }