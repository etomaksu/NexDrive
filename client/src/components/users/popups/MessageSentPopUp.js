import React from 'react'

const MessageSentPopUp = () => {
  return (
    <div>
          <div id="sent-overlay" onClick={onClose}>
    <div id="sent-modal" onClick={(e) => e.stopPropagation()}>
      <button id="sent-close" onClick={onClose} aria-label="Close">
        &times;
      </button>

      <div id="sent-check">
      </div>

      <h2 id="sent-title">Message sent</h2>
      <p id="sent-text">
        Thanks, {name}. We received your message and a manager will reply to
        your email within 24 hours.
      </p>

      <span id="sent-reference">Reference {reference}</span>

      <h3 id="sent-other-title">Other ways to reach us</h3>

      <div id="sent-contacts">
        <div className="contact">
          <span className="contact-label">Email</span>
          <span className="contact-value">help@webname.ph</span>
        </div>

        <div className="contact">
          <span className="contact-label">Phone</span>
          <span className="contact-value">+63 900 000 0000</span>
        </div>

        <div className="contact">
          <span className="contact-label">Visit us</span>
          <span className="contact-value">Imus, Cavite, Philippines</span>
        </div>
      </div>
    </div>
  </div>
    </div>
  )
}

export default MessageSentPopUp
