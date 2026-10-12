import React from 'react'

const RegistrationPage = () => {

    const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
//trygrrgrgr
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
            <nav></nav> //for the login or register option
        
        <form>
            <label id="lbl-1">Full Name</label>
            <input id="inpt-1" name="fullName" type="text" required/>
            
            <label id="lbl-2">Email</label>
            <input id="inpt-1" name="email" type="email" required/>

            <label id="lbl-1">Phone Number</label>
            <input id="inpt-1" name="phoneNum" type="number" required/>

            <label id="lbl-1">Password</label>
            <input id="inpt-1" name="password" type="password" required/>

            <label id="lbl-1">Confirm Password</label>
            <input id="inpt-1" name="confirmPass" type="password" required/>

            <button id="btn-1" type="submit">Create Account</button>
        </form>

        </div>
    </div>
  )
}

export default RegistrationPage
