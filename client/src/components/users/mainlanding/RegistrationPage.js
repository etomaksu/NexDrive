import React, {useState, useEffect }from 'react'
import VerificationPopUp from '../popups/VerificationPopUp';
import axios from 'axios'


const RegistrationPage = ({setCurrentPage}) => {

  const [form, setForm] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: ""
  });

  const [confirmPass, setConfirmPass] = useState('')

  const handleRegister = (e) => {
    e.preventDefault()

    if(form.password !== confirmPass) {
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
              <input 
                  id="register-form-input" 
                  name="password" 
                  type="password" 
                  required
                  placeholder='Enter Password'
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
              />

            <label id="register-form-label">Confirm Password</label>
              <input 
                  id="register-form-input" 
                  name="confirmPass" 
                  type="password"
                  required
                  placeholder='Confirm Password'
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
              />

            <button id="register-form-button" type="submit">Create Account</button>
        </form>

        </div>
    </div>
  )
}

export default RegistrationPage;
