import React, {useState, useEffect }from 'react'
import VerificationPopUp from './VerificationPopUp';


const RegistrationPage = () => {

    const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
//testtt
  return (
    <div>
        <div classname="">
            <h2 id="">NexDrive</h2>
            <h1 id="" >Your next trip starts here.</h1>
            <p id="">Create an account to book faster, trak your bookings, and manage your payment.</p>
        </div>

        <div classname="registration-form">
            <h1 id="hl-2">Create account</h1>
            <p id="desc-1">Register to start renting.</p>
            <nav></nav> 
        
        <form>
            <label id="">Full Name</label>
            <input id="" name="fullName" type="text" required/>
            
            <label id="">Email</label>
            <input id="" name="email" type="email" required/>

            <label id="">Phone Number</label>
            <input id="" name="phoneNum" type="number" required/>

            <label id="">Password</label>
            <input id="" name="password" type="password" required/>

            <label id="">Confirm Password</label>
            <input id="" name="confirmPass" type="password" required/>

            <button id="" type="submit">Create Account</button>
        </form>

        </div>

        {showVerify && (
        <VerificationPopUp email={email} onClose={() => setShowVerify(false)} />
      )}
    </div>
  )
}

export default RegistrationPage
