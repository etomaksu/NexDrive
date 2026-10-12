import React, { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const LoginPage = () => {

    const [login, setLogin] = useState({ email: '', password: '' })
    const [forgot, setForgot] = useState(null)
    const [verify, setVerify] = useState(null)
    const [newPass, setNewPass] = useState(null)

    const handleLogin = () => {
        axios.post("http://localhost:8000/NexDrive/login", login)
            .then((response) => {
                localStorage.setItem('token', response.data.token)
                window.location.href = '/dashboard'
            })
            .catch((error) => {
                console.log(error)
                alert('Invalid email or password')
            })
    }

    const handleForgot = () => {
        axios.post("http://localhost:8000/NexDrive/forgotPassword", forgot)
            .then(() => {
                setVerify({ email: forgot.email, code: '' })
                setForgot(null)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const handleResend = () => {
        axios.post("http://localhost:8000/NexDrive/forgotPassword", { email: verify.email })
            .then(() => {
                alert('Code sent again')
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const handleVerify = () => {
        axios.post("http://localhost:8000/NexDrive/verifyCode", verify)
            .then(() => {
                setNewPass({ email: verify.email, password: '' })
                setVerify(null)
            })
            .catch((error) => {
                console.log(error)
                alert('Invalid code')
            })
    }

    const handleSetPassword = () => {
        axios.post("http://localhost:8000/NexDrive/resetPassword", newPass)
            .then(() => {
                setNewPass(null)
                alert('Password updated')
            })
            .catch((error) => {
                console.log(error)
                alert('Password needs 8+ characters, a capital letter, a number and a symbol')
            })
    }

    return ( //trygrrgrgr
        <div>
            <div classname="">
                <h2 id="logo-name-1">NexDrive</h2>
                <h1 id="hl-1" >Your next trip starts here.</h1>
                <p id="desc-2">Create an account to book faster, track your bookings, and manage your payment.</p>
            </div>

            <div classname="login-form">
                <h1 id="hl-2">Welcome back</h1>
                <p id="desc-1">Log in to manage your bookings.</p>
                
                <nav></nav> //for the login or register option

                <form>
                    <label id="lbl-1">Email</label>
                    <input
                        id="inpt-1"
                        type='email'
                        placeholder='Email'
                        value={login.email}
                        onChange={(e) => { setLogin({ ...login, email: e.target.value }) }}
                    />

                    <label id="lbl-1">Password</label>
                    <input
                        id="inpt-1"
                        type='password'
                        placeholder='Password'
                        value={login.password}
                        onChange={(e) => { setLogin({ ...login, password: e.target.value }) }}
                    />

                    <button id="btn-1" classname="login-btn" onClick={handleLogin}>LOG IN</button>

                    <button id="btn-2" classname="forgotpass-btn" onClick={() => { setForgot({ email: '' }) }}>FORGOT PASSWORD</button>
                </form>
                
                <Link to="/register">REGISTER</Link>
                    </div>

            </div>

    )
}

export default LoginPage