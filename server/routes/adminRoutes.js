const express = require('express');
const router = express.Router()
const {protect, requireRole} = require('../middleware/auth')
const {getDashboard} = require('../controllers/adminController')
const {listCars, createCar, updateCar, archiveCar, setCarStatus} = require('../controllers/adminCarController')
const { listUsers, createUser, updateUser, setUserStatus, archiveUser } = require('../controllers/adminUserController')
const { getReports } = require('../controllers/adminReportController')
const { listTransactions } = require('../controllers/adminTransactionController')
const { listMessages, unreadCount, markRead, replyToMessage } = require('../controllers/adminMessageController')
const { getArchive, restoreRecord } = require('../controllers/adminArchiveController')
const { uploadCarImage } = require('../middleware/upload')


router.use(protect, requireRole('staff', 'admin'))

router.get('/dashboard', getDashboard)

// admin only
router.get('/cars', listCars)
router.patch('/cars/:id/status', setCarStatus)
router.patch('/cars/:id/archive', requireRole('admin'), archiveCar)

router.get('/users', requireRole('admin'), listUsers)
router.post('/users', requireRole('admin'), createUser)
router.put('/users/:id', requireRole('admin'), updateUser)
router.patch('/users/:id/status', requireRole('admin'), setUserStatus)
router.patch('/users/:id/archive', requireRole('admin'), archiveUser)
router.post('/cars', requireRole('admin'), uploadCarImage, createCar)
router.put('/cars/:id', requireRole('admin'), uploadCarImage, updateCar)

router.get('/reports', getReports)

router.get('/transactions', listTransactions)

router.get('/messages', listMessages)
router.get('/messages/unread-count', unreadCount)
router.patch('/messages/:id/read', markRead)
router.post('/messages/:id/reply', replyToMessage)

router.get('/archive', getArchive)
router.patch('/archive/:type/:id/restore', requireRole('admin'), restoreRecord)

module.exports = router
