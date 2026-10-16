import React from 'react'

const RemovePaymentPopUp = () => {
  return (
    <div>
          <div id="remove-overlay" onClick={onClose}>
    <div id="remove-modal" onClick={(e) => e.stopPropagation()}>
      <button id="remove-close" onClick={onClose} aria-label="Close">
        &times;
      </button>

      <h2 id="remove-title">Remove this payment method?</h2>
      <p id="remove-text">
        Are you sure that you want to remove this saved payment method?
      </p>

      <div id="remove-actions">
        <button id="remove-cancel" onClick={onClose}>
          Cancel
        </button>
        <button id="remove-confirm" onClick={onConfirm}>
          Remove
        </button>
      </div>
    </div>
  </div>
    </div>
  )
}

export default RemovePaymentPopUp
