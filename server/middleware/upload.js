const multer = require('multer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

// Saved to server/uploads/cars/ (created automatically)
const dir = path.join(__dirname, '..', 'uploads', 'cars')
fs.mkdirSync(dir, { recursive: true })

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }
const MAX_MB = 5

const upload = multer({
  storage: multer.diskStorage({
    destination: dir,
    filename: (req, file, cb) =>
      cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${EXT[file.mimetype]}`),
  }),
  limits: { fileSize: MAX_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    EXT[file.mimetype] ? cb(null, true) : cb(new Error('Only JPG, PNG or WebP images are allowed')),
})

// Reads one file from the "image" field. Errors come back as JSON so the admin page can show them.
const uploadCarImage = (req, res, next) =>
  upload.single('image')(req, res, (err) => {
    if (!err) return next()
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? `Image must be ${MAX_MB}MB or smaller` : err.message
    res.status(400).json({ message })
  })

module.exports = { uploadCarImage }