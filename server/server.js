const express = require("express")
const app = express()
const mongoose = require('mongoose')
const cors = require("cors")
const userRoutes = require('./routes/userRoutes')
const carRoutes = require('./routes/carRoutes')
const adminRoutes = require('./routes/adminRoutes')
const { createMessage } = require('./controllers/messageController')


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

mongoose.connect("mongodb://127.0.0.1:27017/NexDrive")
.then (() => console.log("DB Connected"))
.catch ((err) => console.error("DB connection error" + err.message))

app.use('/api', userRoutes)
app.use('/api', carRoutes)
app.use('/api/admin', adminRoutes)

app.post('/api/messages', createMessage)

app.listen(8000, () => {
    console.log("Server is running at http://127.0.0.1:8000")
})