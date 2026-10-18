const mongoose = require('mongoose')
const archiveFields = require('./archiveFields')

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, required: true, select: false }, // bcrypt hash
    phone:     { type: String, trim: true },

    role: {
        type: String,
        enum: ['customer', 'staff', 'admin'],
        default: 'customer'
    },

    // Customers only
    licenseNumber: { type: String, trim: true },
    licenseStatus: {
        type: String,
        enum: ['none', 'pending', 'verified', 'rejected'],
        default: 'none'
    }, 
    address: { type: String, trim: true },
    licenseFiles: {
        front: { type: String },
        back:  { type: String },
    },
    status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },
    lastActiveAt: { type: Date },
    resetCodeHash:     { type: String, select: false },
    resetCodeExpires:  { type: Date, select: false },
    resetCodeAttempts: { type: Number, default: 0, select: false },
    resetCodeSentAt:   { type: Date, select: false },
    ...archiveFields,
    }, { timestamps: true });

    // Unique license number, ignoring users who don't have one
    UserSchema.index({ licenseNumber: 1 }, { unique: true, sparse: true 
})

const UserModel = mongoose.model("userAccounts", UserSchema)

module.exports = UserModel;