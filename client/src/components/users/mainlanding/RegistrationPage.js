import React, { useState } from 'react'
import axios from 'axios'

// Same rule the server uses when resetting a password
const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
const PASSWORD_HINT = 'Password needs 8+ characters, a capital letter, a number and a symbol.'

// shown as a live checklist under the password field
const RULES = [
  { key: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { key: 'upper', label: 'One capital letter', test: (p) => /[A-Z]/.test(p) },
  { key: 'number', label: 'One number', test: (p) => /\d/.test(p) },
  { key: 'symbol', label: 'One symbol (! @ # $ ...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

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

// Defined outside RegistrationPage so the input keeps focus while typing
const PasswordInput = ({ show, onToggle, ...inputProps }) => (
  <div className="password-wrap">
    <input {...inputProps} type={show ? 'text' : 'password'} />
    <button
      type="button"
      className="eye-btn"
      onClick={onToggle}
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      <EyeIcon off={show} />
    </button>
  </div>
)

const RegistrationPage = ({ setCurrentPage }) => {

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [confirmPass, setConfirmPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwFocused, setPwFocused] = useState(false)

  const passwordsMatch = form.password === confirmPass

  const handleRegister = (e) => {
    e.preventDefault()

    if (!PASSWORD_RULE.test(form.password)) {
      alert(PASSWORD_HINT)
      return
    }

    if (!passwordsMatch) {
      alert('Passwords do not match')
      return
    }

    axios.post("http://localhost:8000/api/register", form)
    .then (() => {
      alert('Account created! Please log in')
      setCurrentPage('login')
    })
    .catch((error) => {
      console.log(error)
      alert(error.response?.data?.message || 'Something went wrong')
    })
  }

  return (
    <div className="register-page">
    <div className="register-left">
        <h2 id="brandLogo2">NexDrive</h2>
        <h1 id="heading" >Your next trip starts here.</h1>
        <p id="subheading">Create an account to book faster, track your bookings, and manage your payment.</p>
    </div>

    <div className="register-form">
        <h1 id="heading">Create account</h1>
        <p id="desc-1">Register to start renting.</p>
        <nav></nav>

        <form onSubmit={handleRegister}>
            <label id="register-form-label">First Name</label>
              <input
                  id="register-form-input"
                  name="firstName"
                  type="text"
                  required
                  placeholder='Enter First Name'
                  value={form.firstName}
                  onChange={(e) => setForm({...form, firstName: e.target.value})}
              />

            <label id="register-form-label">Last Name</label>
              <input
                  id="register-form-input"
                  name="lastName"
                  type="text"
                  required
                  placeholder='Enter Last Name'
                  value={form.lastName}
                  onChange={(e) => setForm({...form, lastName: e.target.value})}
              />

            <label id="register-form-label">Email</label>
              <input
                  id="register-form-input"
                  name="email"
                  type="email"
                  required
                  placeholder='Enter Email'
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
              />

            <label id="register-form-label">Phone Number</label>
              <input
                  id="register-form-input"
                  name="phone"
                  type="number"
                  required
                  placeholder='Enter Phone Number'
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
              />

            <label id="register-form-label">Password</label>
              <PasswordInput
                  id="register-form-input"
                  name="password"
                  required
                  placeholder='Enter Password'
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  onFocus={() => setPwFocused(true)}
                  onBlur={() => setPwFocused(false)}
                  show={showPass}
                  onToggle={() => setShowPass((s) => !s)}
              />

              {(pwFocused || form.password) && (
                <ul className="pw-rules">
                  {RULES.map((r) => {
                    const ok = r.test(form.password)
                    return (
                      <li key={r.key} className={ok ? 'ok' : ''}>
                        <span className="pw-mark">{ok ? '✓' : '○'}</span>
                        {r.label}
                      </li>
                    )
                  })}
                </ul>
              )}

            <label id="register-form-label">Confirm Password</label>
              <PasswordInput
                  id="register-form-input"
                  name="confirmPass"
                  required
                  placeholder='Confirm Password'
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  show={showConfirm}
                  onToggle={() => setShowConfirm((s) => !s)}
              />

              {confirmPass && (
                <p className={'pw-match ' + (passwordsMatch ? 'ok' : 'bad')}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}

            <button id="register-form-button" type="submit">Create Account</button>
        </form>

        </div>
    </div>
  )
}

export default RegistrationPage;