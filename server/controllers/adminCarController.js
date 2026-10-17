const fs = require('fs')
const path = require('path')
const Car = require('../models/Cars')

// only these fields can be set from the request
const fields = ['name', 'plate', 'type', 'transmission', 'seats', 'fuel', 'price',
  'status', 'imageKey', 'luggage', 'year', 'doors', 'mileage', 'description', 'featured']
const pick = (body) =>
  Object.fromEntries(fields.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]))

// ---- uploaded pictures (saved by middleware/upload.js) ----------------------
const CAR_DIR = path.join(__dirname, '..', 'uploads', 'cars')
const urlFor = (file) => `/uploads/cars/${file.filename}`

// Best-effort delete of a picture we saved earlier (ignores old imageKey cars / missing files)
const removeFile = (imageUrl) => {
  if (!imageUrl || !imageUrl.startsWith('/uploads/cars/')) return
  fs.unlink(path.join(CAR_DIR, path.basename(imageUrl)), () => {})
}

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
  const data = pick(req.body)
  if (req.file) data.imageUrl = urlFor(req.file)
  try {
    res.status(201).json(await Car.create(data))
  } catch (err) {
    if (req.file) removeFile(data.imageUrl) // don't leave an orphan picture behind
    handleError(err, res)
  }
}

const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
    if (!car) {
      if (req.file) removeFile(urlFor(req.file))
      return res.status(404).json({ message: 'Car not found' })
    }

    const update = pick(req.body)
    if (req.file) {
      update.imageUrl = urlFor(req.file) // replace the picture
    } else if (req.body.removeImage === 'true') {
      update.$unset = { imageUrl: '' } // remove it (cards fall back to the old imageKey picture)
    }

    const updated = await Car.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })

    if (req.file || req.body.removeImage === 'true') removeFile(car.imageUrl)
    res.json(updated)
  } catch (err) {
    if (req.file) removeFile(urlFor(req.file))
    handleError(err, res)
  }
}

// PATCH /api/admin/cars/:id/status  { status }   (staff and admin)
const setCarStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!['available', 'rented', 'maintenance'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }
    const car = await Car.findOneAndUpdate(
      { _id: req.params.id, isArchived: { $ne: true } },
      { status },
      { new: true, runValidators: true }
    )
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

module.exports = { listCars, createCar, updateCar, setCarStatus, archiveCar }