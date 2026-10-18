const express = require("express")
const app = express()
const mongoose = require('mongoose')
const cors = require("cors")
const userRoutes = require('./routes/userRoutes')
const carRoutes = require('./routes/carRoutes')
const adminRoutes = require('./routes/adminRoutes')
const { createMessage } = require('./controllers/messageController')
const path = require('path')
const staffRouter = require('express').Router()
const { protect, requireRole } = require('./middleware/auth')
const { listReservations, setReservationStatus, archiveReservation } = require('./controllers/staffReservationController')
const { listCustomers, setLicense, setAccountStatus } = require('./controllers/staffCustomerController')
const reservationRoutes = require('./routes/reservationRoutes')
const profileRoutes = require('./routes/profileRoutes')
const { getCustomerLicenseFile } = require('./controllers/profileController')
const passwordRoutes = require('./routes/passwordRoutes')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

mongoose.connect("mongodb://127.0.0.1:27017/NexDrive")
.then (() => console.log("DB Connected"))
.catch ((err) => console.error("DB connection error" + err.message))

app.use('/api', userRoutes)
app.use('/api', carRoutes)
app.use('/api/admin', adminRoutes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.post('/api/messages', createMessage)

staffRouter.use(protect, requireRole('staff', 'admin'))
staffRouter.get('/reservations', listReservations)
staffRouter.patch('/reservations/:id/status', setReservationStatus)
staffRouter.patch('/reservations/:id/archive', archiveReservation)
staffRouter.get('/customers', listCustomers)
staffRouter.patch('/customers/:id/license', setLicense)
staffRouter.patch('/customers/:id/status', setAccountStatus)
app.use('/api/staff', staffRouter)

app.use('/api/reservations', reservationRoutes)

app.use('/api/profile', profileRoutes)
staffRouter.get('/customers/:id/license/:side', getCustomerLicenseFile)

app.use('/api', passwordRoutes)

app.listen(8000, () => {
    console.log("Server is running at http://127.0.0.1:8000")
})