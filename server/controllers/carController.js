const mongoose = require('mongoose')
const Car = require('../models/Cars')

// archived cars are hidden from customers
const visible = { isArchived: { $ne: true } }

const getCars = async (req, res) => {
    try {
        const cars = await Car.find(visible)
        res.json(cars)
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Server Error"})
    } 
}

const getCarById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({message : 'Car not found'})
        }

        const car = await Car.findOne({ _id: req.params.id, ...visible })
        if (!car) return res.status(404).json({message : 'Car not found'})
        res.json(car)
    } catch (err) {
        console.log(err)
        res.status(500).json({message : 'Server Error'})
    }
}

module.exports = {getCars, getCarById}