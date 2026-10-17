const mongoose = require('mongoose')
const archiveFields = require('./archiveFields')

const ReservationSchema = new mongoose.Schema({
  ref:      { type: String, unique: true },   // "DE-1058"
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'userAccounts', required: true },
  car:      { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },

  pickupAt:       { type: Date, required: true },
  returnAt:       { type: Date, required: true },
  pickupLocation: { type: String },

  days:        { type: Number },
  dailyRate:   { type: Number },
  totalAmount: { type: Number },

  status: {
    type: String,
    enum: ['requested', 'approved', 'rejected', 'active', 'returned', 'completed', 'cancelled'],
    default: 'requested',
    index: true
  },

  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'userAccounts' },

  statusHistory: [{
    status: String,
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'userAccounts' }
  }], ...archiveFields,
}, { timestamps: true })

module.exports = mongoose.model('Reservation', ReservationSchema)