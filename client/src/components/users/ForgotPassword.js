import React, { useState } from 'react'
import VerificationPopUp from './VerificationPopUp';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [showVerify, setShowVerify] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowVerify(true);
  };

  return (
    <div>
      <div className="">
        <h2 id="">NexDrive</h2>
        <h1 id="">We will get you back on the road.</h1>
      </div>

      <div className="forgotpass-form">
        <h1 id="">Forgot your password?</h1>
        <p id="">Enter your email address and we'll send you a link to reset your password.</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            id="label"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit">Send Reset Link</button>
          <button type="button">Back to Login</button>
        </form>
      </div>

      {showVerify && (
        <VerifyModal email={email} onClose={() => setShowVerify(false)} />
      )}
    </div>
  )
}

export default ForgotPassword