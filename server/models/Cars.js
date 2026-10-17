const mongoose = require('mongoose')
const archiveFields = require('./archiveFields')

const CarSchema = new mongoose.Schema({
    name:         { type: String, required: true, trim: true },
    type:         { type: String, required: true },
    transmission: { type: String, required: true },
    seats:        { type: Number, required: true },
    fuel:         { type: String, required: true },
    price:        { type: Number, required: true },   // per day
    imageKey:     { type: String },                   // maps to an image on the frontend
    luggage:      { type: Number },
    year:         { type: Number },
    doors:        { type: Number },
    mileage:      { type: Number },
    description:  { type: String },
    featured:     { type: Boolean, default: false },
    plate:  { type: String, trim: true, unique: true, sparse: true },
    status: { type: String, enum: ['available', 'rented', 'maintenance'], default: 'available' },
    ...archiveFields,
    imageUrl: { type: String },
}, { timestamps: true, toJSON: { virtuals: true }
})

module.exports = mongoose.model('Car', CarSchema)