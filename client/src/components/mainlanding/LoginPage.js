import React, { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const LoginPage = () => {

    const [login, setLogin] = useState({ email: '', password: '' })
    const [forgot, setForgot] = useState(null)
    const [verify, setVerify] = useState(null)
    const [newPass, setNewPass] = useState(null)

    const handleLogin = (e) => {
        e.preventDefault()
        axios.post("http://localhost:8000/api/login", login)
            .then((response) => {
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('role', response.data.user.role)
                window.location.href = response.data.user.role === 'customer' ? '/dashboard' : '/admin'
            })
            .catch((error) => {
                console.log(error)
                alert(error.response?.data?.message || 'Something went wrong')
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

    return ( 
        <div className="login-page">
            <div className="login-left">
                <h2 id="brandLogo2">NexDrive</h2>
                <h1 id="heading" >Your next trip starts here.</h1>
                <p id="subheading">Create an account to book faster, track your bookings, and manage your payment.</p>
            </div>

            <div className="login-form">
                <h1 id="hl-2">Welcome back</h1>
                <p id="desc-1">Log in to manage your bookings.</p>
                
                <nav></nav>

                <form onSubmit={handleLogin}>
                    <label id="">Email</label>
                    <input
                        id=""
                        type='email'
                        placeholder='Email'
                        value={login.email}
                        onChange={(e) => { setLogin({ ...login, email: e.target.value }) }}
                        required
                    />

                    <label id="">Password</label>
                    <input
                        id=""
                        type='password'
                        placeholder='Password'
                        value={login.password}
                        onChange={(e) => { setLogin({ ...login, password: e.target.value }) }}
                        required
                    />

                    <button id="" type="submit">LOG IN</button>

                    <button className="forgotPass"  onClick={() => { setForgot({ email: '' }) }}>Forgot password?</button>
                </form>

                
                <Link to="/register">REGISTER</Link>
                    </div>

            </div>

    )
}

export default LoginPage