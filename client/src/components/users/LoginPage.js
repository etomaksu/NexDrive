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

    return ( //testtt
        <div>
            <div classname="">
                <h2 id="">NexDrive</h2>
                <h1 id="" >Your next trip starts here.</h1>
                <p id="">Create an account to book faster, track your bookings, and manage your payment.</p>
            </div>

            <div classname="">
                <h1 id="">Welcome back</h1>
                <p id="">Log in to manage your bookings.</p>
                
                <nav></nav>

                <form>
                    <label id="">Email</label>
                    <input
                        id=""
                        type='email'
                        placeholder='Email'
                        value={login.email}
                        onChange={(e) => { setLogin({ ...login, email: e.target.value }) }}
                    />

                    <label id="">Password</label>
                    <input
                        id=""
                        type='password'
                        placeholder='Password'
                        value={login.password}
                        onChange={(e) => { setLogin({ ...login, password: e.target.value }) }}
                    />

                    <button id=""  onClick={handleLogin}>LOG IN</button>

                    <button id=""  onClick={() => { setForgot({ email: '' }) }}>FORGOT PASSWORD</button>
                </form>
                
                <Link to="/register">REGISTER</Link>
                    </div>

            </div>

    )
}

export default LoginPage