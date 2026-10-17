const Car = require('../models/Cars')

// only these fields can be set from the request
const fields = ['name', 'plate', 'type', 'transmission', 'seats', 'fuel', 'price',
  'status', 'imageKey', 'luggage', 'year', 'doors', 'mileage', 'description', 'featured']
const pick = (body) =>
  Object.fromEntries(fields.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]))

const handleError = (err, res) => {
  if (err.code === 11000) return res.status(409).json({ message: 'Plate number already exists' })
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message })
  console.log(err)
  res.status(500).json({ message: 'Server Error' })
}

const listCars = async (req, res) => {
  try {
    res.json(await Car.find({ isArchived: { $ne: true } }).sort({ name: 1 }))
  } catch (err) { handleError(err, res) }
}

const createCar = async (req, res) => {
  try {
    res.status(201).json(await Car.create(pick(req.body)))
  } catch (err) { handleError(err, res) }
}

const updateCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true })
    if (!car) return res.status(404).json({ message: 'Car not found' })
    res.json(car)
  } catch (err) { handleError(err, res) }
}

const archiveCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { isArchived: true, archivedAt: new Date(), archivedBy: req.user.id, archiveReason: req.body.reason || 'Archived' },
      { new: true }
    )
    if (!car) return res.status(404).json({ message: 'Car not found' })
    res.json(car)
  } catch (err) { handleError(err, res) }
}

module.exports = { listCars, createCar, updateCar, archiveCar }