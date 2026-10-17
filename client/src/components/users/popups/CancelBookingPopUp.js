import React from 'react'

const CancelBookingPopUp = () => {
  return (
    <div>
    <div id="cancel-overlay" onClick={onClose}>
    <div id="cancel-modal" onClick={(e) => e.stopPropagation()}>
      <button id="cancel-close" onClick={onClose} aria-label="Close">
        &times;
      </button>

      <h2 id="cancel-title">Cancellation</h2>
      <p id="cancel-text">Your're going to cancel your Booking</p>

      <div id="cancel-actions">
        <button id="cancel-keep" onClick={onClose}>
          No, keep it.
        </button>
        <button id="cancel-confirm" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    </div>
  </div>
    </div>
  )
}

export default CancelBookingPopUp
