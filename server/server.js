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

app.listen(8000, () => {
    console.log("Server is running at http://127.0.0.1:8000")
})