const UserModel = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body

        const user = await UserModel.findOne({ email }).select('+password')

        if (!user) {
            return res.status(401).json({message: 'Invalid email or password'})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({message: 'Invalid email or password'})
        }

        const token = jwt.sign(
            {id: user._id, role: user.role},
            process.env.JWT_SECRET || 'dev_secret_change_me',
            {expiresIn: '1d'}
        )

        res.json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({message: 'Server Error'})
    }
}

const registerUser = async (req,res) => {
    try {
        const {firstName, lastName, email, password, phone} = req.body

        if (!firstName || !lastName || !email || !password || !phone) {
            return res.status(400).json({message: "Please fill in all fields"})
        }

        const exists = await UserModel.findOne({email})
        if (exists) {
            return res.status(409).json({message: "Email is already registered"})

        }

        const hashed = await bcrypt.hash(password, 10)

        const newUser = {
            firstName, lastName, email, password:hashed, phone, role: 'customer'
        }

        await UserModel.create(newUser)
        res.status(201).json({message: 'Account created'})
    } catch (err) {
        console.log(err)
        if (err.code === 11000) {
            return res.status(409).json({message: 'Email is already registered'})
        }
        res.status(500).json({message:'Server Error'})
    }
}

module.exports = {loginUser, registerUser}