import React from 'react'

const SetNewPassword = () => {
  return ( //ff
    <div className="setnewpass-page">
    <div className="setnewpass-left">
      <h2 className="sn-logo">NexDrive</h2>

      <img
        className="sn-car"
        src="/images/mitsubishi-xpander.png"
        alt="Mitsubishi Xpander"
      />

      <h1 className="sn-tagline">A fresh start for your account.</h1>
    </div>

    <div className="setnewpass-right">
      <div className="setnewpass-form">
        <h1 className="sn-title">Set a new password</h1>
        <p className="sn-text">Use at least 8 characters, including a number.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="newPassword">New password</label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <label htmlFor="confirmPassword">Confirm new password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="sn-submit">
            Update password
          </button>
        </form>

        <button type="button" className="sn-back">
          Back to login
        </button>
      </div>
    </div>
  </div>
  )
}

export default SetNewPassword
 