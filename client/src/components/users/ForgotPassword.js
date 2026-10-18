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
    <div className="forgotpassword-page">
    <div className="forgotpassword-left">
      <h2 className="fp-logo">NexDrive</h2>

      <img
        className="fp-car"
        src="/images/mitsubishi-xpander.png"
        alt="Mitsubishi Xpander"
      />

      <h1 className="fp-tagline">We will get you back on the road.</h1>
    </div>

    <div className="forgotpassword-right">
      <div className="forgotpass-form">
        <h1 className="fp-title">Forgot your password?</h1>
        <p className="fp-text">
          Enter the email on your account and we will send you a link to reset it.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="fp-submit">
            Send verification code
          </button>
        </form>

        <button type="button" className="fp-back">
          Back to login
        </button>
      </div>
    </div>

    {showVerify && (
      <VerificationPopUp email={email} onClose={() => setShowVerify(false)} />
    )}
  </div>
  )
}

export default ForgotPassword