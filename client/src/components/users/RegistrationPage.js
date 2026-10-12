import React from 'react'

const RegistrationPage = () => {

    const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  return (
    <div>
        <div classname="">
            <h2 classname="logo-name-1">NexDrive</h2>
            <h1 classname="" >Your next trip starts here.</h1>
            <p classname="">Create an account to book faster, trak your bookings, and manage your payment.</p>
        </div>

        <div classname="registration-form">
            <h1>Create account</h1>
            <p>Register to start renting.</p>
            <nav></nav> //for the login or register option
        
        <form>
            <label>Full Name</label>
            <input id="fullName" name="fullName" type="text" required/>
            
            <label>Email</label>
            <input id="email" name="email" type="email" required/>

            <label>Phone Number</label>
            <input id="phoneNum" name="phoneNum" type="number" required/>

            <label>Password</label>
            <input id="password" name="password" type="password" required/>

            <label>Confirm Password</label>
            <input id="confirmPass" name="confirmPass" type="password" required/>

            <button type="submit">Create Account</button>
        </form>

        </div>
    </div>
  )
}

export default RegistrationPage
