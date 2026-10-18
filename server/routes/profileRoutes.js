const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')   // same file adminRoutes.js imports protect from
const { uploadLicenseImages } = require('../middleware/uploadLicense')
const { getProfile, updateProfile, uploadLicense, getMyLicenseFile } = require('../controllers/profileController')

router.use(protect)

router.get('/', getProfile)
router.put('/', updateProfile)
router.post('/license', uploadLicenseImages, uploadLicense)
router.get('/license/:side', getMyLicenseFile)

module.exports = router