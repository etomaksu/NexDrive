const mongoose = require('mongoose')
const archiveFields = require('./archiveFields')

const ReservationSchema = new mongoose.Schema(
  {
    // Human-friendly booking number, e.g. DE-1058
    ref: { type: String, required: true, unique: true, trim: true },

    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'userAccounts', required: true },
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },

    pickupAt: { type: Date, required: true },
    returnAt: { type: Date, required: true },
    pickupLocation: { type: String, trim: true },
    returnLocation: { type: String, trim: true },

    days: { type: Number, required: true, min: 1 },
    dailyRate: { type: Number, required: true, min: 0 },
    addons: [{ _id: false, id: String, name: String, pricePerDay: Number }],
    serviceFee: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'active', 'returned', 'completed', 'cancelled'],
      default: 'requested',
      index: true,
    },

    // Staff/admin who approved or handled it
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'userAccounts' },

    statusHistory: [
      {
        _id: false,
        status: String,
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'userAccounts' },
      },
    ],

    ...archiveFields,
  },
  { timestamps: true }
)

module.exports = mongoose.model('Reservation', ReservationSchema)