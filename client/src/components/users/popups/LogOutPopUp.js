import React from 'react'

const LogOutPopUp = () => {
  return (
        <div>
            <div id="logout-overlay" onClick={onClose}>
        <div id="logout-modal" onClick={(e) => e.stopPropagation()}>
        <button id="logout-close" onClick={onClose} aria-label="Close">
            &times;
        </button>
    
        <h2 id="logout-title">Logout</h2>
        <p id="logout-text">Are you sure that you want to logout?</p>

        <div id="logout-actions">
            <button id="logout-no" onClick={onClose}>
            No
            </button>
            <button id="logout-yes" onClick={onConfirm}>
            Yes, I want to logout.
            </button>
        </div>
        </div>
    </div>
    </div>
  )
}

export default LogOutPopUp
