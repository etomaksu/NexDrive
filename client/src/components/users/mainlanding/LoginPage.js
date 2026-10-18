import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Modal, Input, Button, message } from 'antd'

const API = 'http://localhost:8000/api'
const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
const PASSWORD_HINT = 'At least 8 characters with a capital letter, a number and a symbol.'
const errText = (error, fallback) => error.response?.data?.message || fallback

// App.js passes in:
//   setCurrentPage -> to move between pages
//   onLogin(name)  -> tells the app someone is logged in (navbar + home page switch)

const EyeIcon = ({ off }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {off ? (
            <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </>
        ) : (
            <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </>
        )}
    </svg>
)

const LoginPage = ({ setCurrentPage, onLogin }) => {

    const [login, setLogin] = useState({ email: '', password: '' })

    // forgot password steps: only one of these is open at a time
    const [forgot, setForgot] = useState(null)     // step 1: { email }
    const [verify, setVerify] = useState(null)     // step 2: { email, code }
    const [newPass, setNewPass] = useState(null)   // step 3: { email, code, password, confirm }
    const [busy, setBusy] = useState(false)
    const [err, setErr] = useState('')
    const [cooldown, setCooldown] = useState(0)    // seconds until "Resend code" works again
    const [showPassword, setShowPassword] = useState(false)

    const HOME = { customer: '/dashboard', admin: '/admin', staff: '/staff' }

    // counts the resend timer down
    useEffect(() => {
        if (cooldown <= 0) return
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
        return () => clearTimeout(t)
    }, [cooldown])

    const handleLogin = (e) => {
        e.preventDefault()
        axios.post(`${API}/login`, login)
            .then((response) => {
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('role', response.data.user.role)
                localStorage.setItem('user', JSON.stringify(response.data.user))
                window.location.href = HOME[response.data.user.role] || '/dashboard'
            })
            .catch((error) => {
                console.log(error)
                alert(error.response?.data?.message || 'Something went wrong')
            })
    }

    const closeAll = () => {
        setForgot(null)
        setVerify(null)
        setNewPass(null)
        setErr('')
    }

    const openForgot = () => {
        setErr('')
        setForgot({ email: login.email }) // reuse what they already typed
    }

    // step 1: ask the server to email a code
    const handleForgot = async () => {
        const email = forgot.email.trim().toLowerCase()
        if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter a valid email.')

        try {
            setBusy(true)
            setErr('')
            await axios.post(`${API}/forgot-password`, { email })
            setForgot(null)
            setVerify({ email, code: '' })
            setCooldown(60)
        } catch (error) {
            setErr(errText(error, 'Could not send the code. Please try again.'))
        } finally {
            setBusy(false)
        }
    }

    const handleResend = async () => {
        if (cooldown > 0) return
        try {
            setBusy(true)
            setErr('')
            await axios.post(`${API}/forgot-password`, { email: verify.email })
            message.success('A new code was sent')
            setCooldown(60)
        } catch (error) {
            setErr(errText(error, 'Could not send the code. Please try again.'))
        } finally {
            setBusy(false)
        }
    }

    // step 2: check the code
    const handleVerify = async () => {
        if (!/^\d{6}$/.test(verify.code)) return setErr('Enter the 6-digit code.')

        try {
            setBusy(true)
            setErr('')
            await axios.post(`${API}/verify-code`, verify)
            setNewPass({ email: verify.email, code: verify.code, password: '', confirm: '' })
            setVerify(null)
        } catch (error) {
            setErr(errText(error, 'Invalid or expired code.'))
        } finally {
            setBusy(false)
        }
    }

    // step 3: save the new password
    const handleSetPassword = async () => {
        if (!PASSWORD_RULE.test(newPass.password)) return setErr(PASSWORD_HINT)
        if (newPass.password !== newPass.confirm) return setErr('The two passwords do not match.')

        try {
            setBusy(true)
            setErr('')
            await axios.post(`${API}/reset-password`, {
                email: newPass.email,
                code: newPass.code,
                password: newPass.password,
            })
            setLogin({ email: newPass.email, password: '' })
            closeAll()
            message.success('Password updated. You can log in now.')
        } catch (error) {
            setErr(errText(error, 'Could not update the password.'))
        } finally {
            setBusy(false)
        }
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
                    <div className="password-wrap">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder='Password'
                            value={login.password}
                            onChange={(e) => { setLogin({ ...login, password: e.target.value }) }}
                            required
                        />
                        <button
                            type="button"
                            className="eye-btn"
                            onClick={() => setShowPassword((s) => !s)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            <EyeIcon off={showPassword} />
                        </button>
                    </div>

                    <button id="" type="submit">LOG IN</button>

                    <button
                        type="button"
                        className="forgotPass"
                        onClick={openForgot}
                    >
                        Forgot password?
                    </button>
                </form>

                <button type="button" onClick={() => setCurrentPage('register')}>
                    REGISTER
                </button>
            </div>

            {/* Step 1: email */}
            <Modal title="Forgot password" open={Boolean(forgot)} onCancel={closeAll} footer={null} destroyOnClose>
                {forgot && (
                    <form onSubmit={(e) => { e.preventDefault(); handleForgot() }}>
                        <p style={{ color: '#64748b', marginTop: 0 }}>
                            Enter your account email and we'll send you a 6-digit code.
                        </p>
                        <Input
                            type="email"
                            placeholder="Email"
                            size="large"
                            autoFocus
                            value={forgot.email}
                            onChange={(e) => setForgot({ email: e.target.value })}
                        />
                        {err && <p style={{ color: '#b91c1c', margin: '8px 0 0' }}>{err}</p>}
                        <Button type="primary" htmlType="submit" size="large" block loading={busy} style={{ marginTop: 16 }}>
                            Send code
                        </Button>
                    </form>
                )}
            </Modal>

            {/* Step 2: code */}
            <Modal title="Enter your code" open={Boolean(verify)} onCancel={closeAll} footer={null} destroyOnClose>
                {verify && (
                    <form onSubmit={(e) => { e.preventDefault(); handleVerify() }}>
                        <p style={{ color: '#64748b', marginTop: 0 }}>
                            If <strong>{verify.email}</strong> has an account, we sent a 6-digit code to it. It expires in 10 minutes.
                        </p>
                        <Input
                            placeholder="6-digit code"
                            size="large"
                            maxLength={6}
                            inputMode="numeric"
                            autoFocus
                            value={verify.code}
                            onChange={(e) => setVerify({ ...verify, code: e.target.value.replace(/\D/g, '') })}
                        />
                        {err && <p style={{ color: '#b91c1c', margin: '8px 0 0' }}>{err}</p>}
                        <Button type="primary" htmlType="submit" size="large" block loading={busy} style={{ marginTop: 16 }}>
                            Verify code
                        </Button>
                        <Button type="link" block disabled={cooldown > 0 || busy} onClick={handleResend} style={{ marginTop: 8 }}>
                            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                        </Button>
                    </form>
                )}
            </Modal>

            {/* Step 3: new password */}
            <Modal title="Set a new password" open={Boolean(newPass)} onCancel={closeAll} footer={null} destroyOnClose>
                {newPass && (
                    <form onSubmit={(e) => { e.preventDefault(); handleSetPassword() }}>
                        <Input.Password
                            placeholder="New password"
                            size="large"
                            autoFocus
                            value={newPass.password}
                            onChange={(e) => setNewPass({ ...newPass, password: e.target.value })}
                        />
                        <Input.Password
                            placeholder="Confirm new password"
                            size="large"
                            style={{ marginTop: 12 }}
                            value={newPass.confirm}
                            onChange={(e) => setNewPass({ ...newPass, confirm: e.target.value })}
                        />
                        <p style={{ color: '#64748b', fontSize: 12, margin: '8px 0 0' }}>{PASSWORD_HINT}</p>
                        {err && <p style={{ color: '#b91c1c', margin: '8px 0 0' }}>{err}</p>}
                        <Button type="primary" htmlType="submit" size="large" block loading={busy} style={{ marginTop: 16 }}>
                            Save new password
                        </Button>
                    </form>
                )}
            </Modal>
        </div>
    )
}

export default LoginPage