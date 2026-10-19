const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')   // same file adminRoutes.js imports protect from
const { getAvailability, getOptions, quoteBooking, checkout, listMine, cancelReservation } = require('../controllers/reservationController')

router.use(protect)

router.get('/availability/:carId', getAvailability)
router.get('/options', getOptions)
router.get('/mine', listMine)
router.post('/quote', quoteBooking)              // price preview, saves nothing
router.post('/checkout', checkout)               // creates the booking and records the payment
router.patch('/:id/cancel', cancelReservation)

module.exports = router