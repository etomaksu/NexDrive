import React from 'react'

const ReceiptPopUp = () => {
  return (
    <div>
      <div id="receipt-overlay" onClick={onClose}>
    <div id="receipt-modal" onClick={(e) => e.stopPropagation()}>
      <div id="receipt-header">
        <div>
          <h2 id="receipt-title">Receipt</h2>
          <p id="receipt-ref">Reference #{receipt.code}</p>
        </div>

        <div id="receipt-header-right">
          <span id="receipt-status">{receipt.paymentStatus}</span>
          <button id="receipt-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
      </div>

      <p className="receipt-section">TRIP DETAILS</p>

      <div className="receipt-row">
        <span className="receipt-label">Vehicle</span>
        <span className="receipt-value">{receipt.carName}</span>
      </div>

      <div className="receipt-row">
        <span className="receipt-label">Pick-up</span>
        <div className="receipt-value-block">
          <span className="receipt-value">{formatDateTime(receipt.pickupAt)}</span>
          <span className="receipt-sub">{receipt.pickupLocation}</span>
        </div>
      </div>

      <div className="receipt-row">
        <span className="receipt-label">Return</span>
        <div className="receipt-value-block">
          <span className="receipt-value">{formatDateTime(receipt.returnAt)}</span>
          <span className="receipt-sub">{receipt.returnLocation}</span>
        </div>
      </div>

      <hr className="receipt-divider" />

      <p className="receipt-section">CHARGES</p>

      <div className="receipt-row">
        <div>
          <span className="receipt-label">Rental</span>
          <span className="receipt-sub block">
            {receipt.days} days × ₱{receipt.price.toLocaleString()}
          </span>
        </div>
        <span className="receipt-value">₱{receipt.rentalTotal.toLocaleString()}</span>
      </div>

      <div className="receipt-row">
        <span className="receipt-label">Add-ons</span>
        <span className="receipt-value">₱{receipt.addonsTotal.toLocaleString()}</span>
      </div>

      <div className="receipt-row">
        <span className="receipt-label">Service fee</span>
        <span className="receipt-value">₱{receipt.serviceFee.toLocaleString()}</span>
      </div>

      <div className="receipt-row">
        <span className="receipt-total-label">Booking total</span>
        <span className="receipt-value">₱{receipt.total.toLocaleString()}</span>
      </div>

      <div id="receipt-paid-box">
        <span id="receipt-paid-label">Downpayment paid (50%)</span>
        <span id="receipt-paid-amount">₱{receipt.downpayment.toLocaleString()}</span>
      </div>

      <div className="receipt-row">
        <span className="receipt-label">Balance due at pick-up</span>
        <span className="receipt-value">₱{receipt.balance.toLocaleString()}</span>
      </div>

      <button id="receipt-download" onClick={onDownload}>
        Download receipt
      </button>
    </div>
  </div>
    </div>
  )
}

export default ReceiptPopUp
