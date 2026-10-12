const express = require("express")
const app = express()
const cors = require("cors")
    
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get("/api/tryserver", (req,res) =>{
    res.json({
        message:"wiw"
    })
})

app.listen(8000, () => {
    console.log("Server is running at http://localhost:8000")
})