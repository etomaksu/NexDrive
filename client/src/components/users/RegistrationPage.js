import React, {useState, useEffect }from 'react'


const RegistrationPage = () => {

    const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  return (
    <div>
        <div classname="">
            <h2 id="logo-name-1">NexDrive</h2>
            <h1 id="hl-1" >Your next trip starts here.</h1>
            <p id="desc-2">Create an account to book faster, trak your bookings, and manage your payment.</p>
        </div>

        <div classname="registration-form">
            <h1 id="hl-2">Create account</h1>
            <p id="desc-1">Register to start renting.</p>
            <nav></nav> 
        
        <form>
            <label>Full Name</label>
            <input id="label" name="fullName" type="text" required/>
            
            <label>Email</label>
            <input id="label" name="email" type="email" required/>

            <label>Phone Number</label>
            <input id="label" name="phoneNum" type="number" required/>

            <label>Password</label>
            <input id="label" name="password" type="password" required/>

            <label>Confirm Password</label>
            <input id="label" name="confirmPass" type="password" required/>

            <button type="submit">Create Account</button>
        </form>

        </div>
    </div>
  )
}

export default RegistrationPage
