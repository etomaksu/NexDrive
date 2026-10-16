import React, { useState } from 'react'
import axios from 'axios'

// App.js passes in:
//   setCurrentPage -> to move between pages
//   onLogin(name)  -> tells the app someone is logged in (navbar + home page switch)
const LoginPage = ({ setCurrentPage, onLogin }) => {

    const [login, setLogin] = useState({ email: '', password: '' })
    const [forgot, setForgot] = useState(null)
    const [verify, setVerify] = useState(null)
    const [newPass, setNewPass] = useState(null)

    const handleLogin = (e) => {
        e.preventDefault() // stop the form from reloading the page

        axios.post("http://localhost:8000/NexDrive/login", login)
            .then((response) => {
                localStorage.setItem('token', response.data.token)

                // use the name your backend returns; falls back to the part of the email before "@"
                const name =
                    response.data.name ||
                    (response.data.user && response.data.user.name) ||
                    login.email.split('@')[0]

                onLogin(name) // App.js sets the user and goes to the home page
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

    return (
        <div className="login-page">
            <div className="login-left">
                <h2 id="brandLogo2">NexDrive</h2>
                <h1 id="heading">Your next trip starts here.</h1>
                <p id="subheading">Create an account to book faster, track your bookings, and manage your payment.</p>
            </div>

            <div className="login-form">
                <h1 id="hl-2">Welcome back</h1>
                <p id="desc-1">Log in to manage your bookings.</p>

                <nav></nav>

                <form onSubmit={handleLogin}>
                    <label>Email</label>
                    <input
                        type='email'
                        placeholder='Email'
                        value={login.email}
                        onChange={(e) => { setLogin({ ...login, email: e.target.value }) }}
                        required
                    />

                    <label>Password</label>
                    <input
                        type='password'
                        placeholder='Password'
                        value={login.password}
                        onChange={(e) => { setLogin({ ...login, password: e.target.value }) }}
                        required
                    />

                    <button type="submit">LOG IN</button>

                    <button
                        type="button"
                        className="forgotPass"
                        onClick={() => { setForgot({ email: '' }) }}
                    >
                        Forgot password?
                    </button>
                </form>

                <button type="button" onClick={() => setCurrentPage('register')}>
                    REGISTER
                </button>
            </div>
        </div>
    )
}

export default LoginPage