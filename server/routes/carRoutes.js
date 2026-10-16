const express = require('express')
const router = express.Router()
const {getCars, getCarById} = require('../controllers/carController')

router.get('/cars', getCars)
router.get('/cars/:id', getCarById)

module.exports = router