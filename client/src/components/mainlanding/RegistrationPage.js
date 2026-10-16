import React, {useState, useEffect }from 'react'
import VerificationPopUp from '../users/VerificationPopUp';


const RegistrationPage = () => {

    const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  

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
    
        <form>
            <label id="register-form-label">Full Name</label>
              <input 
                  id="register-form-input" 
                  name="fullName" 
                  type="text" 
                  required
              />
            
            <label id="register-form-label">Email</label>
              <input 
                  id="register-form-input" 
                  name="email" 
                  type="email" 
                  required
              />

            <label id="register-form-label">Phone Number</label>
              <input 
                  id="register-form-input" 
                  name="phoneNum" 
                  type="number" 
                  required
              />

            <label id="register-form-label">Password</label>
              <input 
                  id="register-form-input" 
                  name="password" 
                  type="password" 
                  required
              />

            <label id="register-form-label">Confirm Password</label>
              <input 
                  id="register-form-input" 
                  name="confirmPass" 
                  type="password"
                  required
              />

            <button id="register-form-button" type="submit">Create Account</button>
        </form>

        </div>
    </div>
  )
}

export default RegistrationPage;
