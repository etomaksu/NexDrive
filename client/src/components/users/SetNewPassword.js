import React from 'react'

const SetNewPassword = () => {
  return (
    <div className="setnewpass-page">
      <div className="setnewpass-left">
            <h2 id="">NexDrive</h2>
            <h1 id="" >A fresh start for your account.</h1>
        </div>

        <div className="setnewpass-form">
            <h1 id="">Set a new password</h1>
            <p id="">Use at least 8 characters, including a number.</p>
        
        <form>
            <label>New Password</label>
            <input id="label" name="newPassword" type="password" required/>

            <label>Confirm Password</label>
            <input id="label" name="confirmPassword" type="password" required/>

            <button type="submit">Update password</button>
            <button type="submit">Back to Login</button>
        </form>

        </div>
    </div>
  )
}

export default SetNewPassword
 