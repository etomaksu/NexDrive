const multer = require('multer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

// Licenses are private: saved OUTSIDE the public /uploads folder (server/private/licenses/)
// and only ever sent back through a logged-in route.
const dir = path.join(__dirname, '..', 'private', 'licenses')
fs.mkdirSync(dir, { recursive: true })

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png' }
const MAX_MB = 5

const upload = multer({
  storage: multer.diskStorage({
    destination: dir,
    filename: (req, file, cb) =>
      cb(null, `${req.user.id}-${file.fieldname}-${crypto.randomBytes(4).toString('hex')}${EXT[file.mimetype]}`),
  }),
  limits: { fileSize: MAX_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    EXT[file.mimetype] ? cb(null, true) : cb(new Error('Only JPG or PNG images are allowed')),
})

// Reads up to two files: "front" and "back". Errors come back as JSON.
const uploadLicenseImages = (req, res, next) =>
  upload.fields([{ name: 'front', maxCount: 1 }, { name: 'back', maxCount: 1 }])(req, res, (err) => {
    if (!err) return next()
    const message = err.code === 'LIMIT_FILE_SIZE' ? `Each image must be ${MAX_MB}MB or smaller` : err.message
    res.status(400).json({ message })
  })

module.exports = { uploadLicenseImages, LICENSE_DIR: dir }