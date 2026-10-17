const express = require('express');
const router = express.Router()
const {protect, requireRole} = require('../middleware/auth')
const {getDashboard} = require('../controllers/adminController')
const {listCars, createCar, updateCar, archiveCar} = require('../controllers/adminCarController')

router.use(protect, requireRole('staff', 'admin'))

router.get('/dashboard', getDashboard)

// admin only
router.get('/cars', requireRole('admin'), listCars)
router.post('/cars', requireRole('admin'), createCar)
router.put('/cars/:id', requireRole('admin'), updateCar)
router.patch('/cars/:id/archive', requireRole('admin'), archiveCar)

module.exports = router
