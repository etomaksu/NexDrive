import React from 'react'

const PasswordUpdated = () => {
  return (
    <div>
      <div className="passupdated-page">
    <div className="passupdated-left">
      <h2 className="pu-logo">NexDrive</h2>

      <img
        className="pu-car"
        src="/images/mitsubishi-xpander.png"
        alt="Mitsubishi Xpander"
      />

      <h1 className="pu-tagline">A fresh start for your account.</h1>
    </div>

    <div className="passupdated-right">
      <div className="passupdated-content">
        <h1 className="pu-title">Password updated</h1>
        <p className="pu-text">
          You’ve been signed out of all devices. We’ve emailed a confirmation
          to your email.
        </p>

        <button type="button" className="pu-btn" onClick={() => navigate('/login')}>
          Back to login
        </button>
      </div>
    </div>
  </div>
    </div>
  )
}

export default PasswordUpdated
