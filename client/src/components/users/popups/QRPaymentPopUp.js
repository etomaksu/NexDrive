import React from 'react'
import { CloseOutlined, DownloadOutlined, LockOutlined } from '@ant-design/icons'
import './src/components/users/popups/QRPaymentPopUp.css'

const QRPaymentPopUp = () => {
  return (
      <div id="qr-overlay" onClick={onClose}>
      <div id="qr-modal" onClick={(e) => e.stopPropagation()}>
        <div id="qr-header">
          <span id="qr-method">
            <span id="qr-dot" />
            Bank transfer · Mobile banking
          </span>
          <button id="qr-close" onClick={onClose} aria-label="Close">
            <CloseOutlined />
          </button>
        </div>

        <h2 id="qr-title">Scan to pay ₱{payment.amount.toLocaleString()}</h2>
        <p id="qr-text">
          Downpayment (50%) for booking #{payment.bookingCode}. Scan it now, or
          download the QR code to pay later.
        </p>

        <div id="qr-panel">
          <div id="qr-box">
            <img id="qr-image" src={payment.qrImage} alt="Payment QR code" />
          </div>
          <p id="qr-hint">
            Scan with your banking app, then upload your proof of payment
          </p>
        </div>

        <div id="qr-info">
          <div className="qr-info-item">
            <span className="qr-info-label">AMOUNT</span>
            <span className="qr-info-value">
              ₱{payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="qr-info-item">
            <span className="qr-info-label">REFERENCE</span>
            <span className="qr-info-value">{payment.reference}</span>
          </div>

          <div className="qr-info-item">
            <span className="qr-info-label">EXPIRES IN</span>
            <span className="qr-info-value">{timeLeft}</span>
          </div>
        </div>

        <button id="qr-download" onClick={onDownload}>
          <DownloadOutlined />
          Download
        </button>

        <p id="qr-secure">
          <LockOutlined />
          Your payment is encrypted and secure.
        </p>
      </div>
    </div>
  )
}

export default QRPaymentPopUp
