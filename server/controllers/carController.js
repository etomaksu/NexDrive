const mongoose = require('mongoose')
const Car = require('../models/Cars')

const getCars = async (req, res) => {
    try {
        console.log(
        'DB:', mongoose.connection.name,
        '| collection:', Car.collection.name,
        '| count:', await Car.countDocuments()
        )
        const cars = await Car.find()
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

        const car = await Car.findById(req.params.id)
        if (!car) return res.status(404).json({message : 'Car not found'})
        res.json(car)
    } catch (err) {
        console.log(err)
        res.status(500).json({message : 'Server Error'})
    }
}

module.exports = {getCars, getCarById}