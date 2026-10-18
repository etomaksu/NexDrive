const express = require('express')
const router = express.Router()
const { forgotPassword, verifyCode, resetPassword } = require('../controllers/passwordResetController')

// public routes (the user isn't logged in when they forget their password)
router.post('/forgot-password', forgotPassword)
router.post('/verify-code', verifyCode)
router.post('/reset-password', resetPassword)

module.exports = router