import React, { useEffect, useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { CloseOutlined, DownloadOutlined, LockOutlined } from '@ant-design/icons'
import './QRPaymentPopUp.css'

// MOCKUP: there is no real payment provider, so the "scan" is simulated.
// The payment goes through by itself after a few seconds (or right away if you click the QR code).
const SIMULATED_SCAN_MS = 5000
const EXPIRES_IN_SECONDS = 15 * 60

const METHOD_LABEL = {
  gcash: 'GCash · E-wallet',
  maya: 'Maya · E-wallet',
  bank: 'Bank transfer · Mobile banking',
}

const HINT = {
  gcash: 'Scan with your GCash app to pay',
  maya: 'Scan with your Maya app to pay',
  bank: 'Scan with your banking app to pay',
}

const formatTime = (secs) => `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`

// payment: { method, amount, optionLabel, carName, reference, qrValue }
// onClose  -> the customer cancelled
// onPaid   -> the (simulated) scan went through; the page then records the payment
const QRPaymentPopUp = ({ payment, onClose, onPaid }) => {
  const [secondsLeft, setSecondsLeft] = useState(EXPIRES_IN_SECONDS)
  const [scanned, setScanned] = useState(false)
  const doneRef = useRef(false)

  // countdown
  useEffect(() => {
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (secondsLeft === 0 && !scanned) onClose()
  }, [secondsLeft, scanned, onClose])

  const handleScanned = () => {
    if (doneRef.current) return
    doneRef.current = true
    setScanned(true)
    setTimeout(onPaid, 1200) // brief "payment received" moment, then the receipt
  }

  // simulated scan
  useEffect(() => {
    const id = setTimeout(handleScanned, SIMULATED_SCAN_MS)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDownload = () => {
    const canvas = document.getElementById('qr-image')
    if (!canvas) return
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `qr-${payment.reference}.png`
    link.click()
  }

  const handleClose = () => { if (!scanned) onClose() }

  return (
    <div id="qr-overlay" onClick={handleClose}>
      <div id="qr-modal" onClick={(e) => e.stopPropagation()}>
        <div id="qr-header">
          <span id="qr-method">
            <span id="qr-dot" />
            {METHOD_LABEL[payment.method] || 'QR payment'}
          </span>
          <button id="qr-close" onClick={handleClose} aria-label="Close">
            <CloseOutlined />
          </button>
        </div>

        <h2 id="qr-title">Scan to pay ₱{payment.amount.toLocaleString()}</h2>
        <p id="qr-text">
          {payment.optionLabel} for your {payment.carName} booking. Scan it now, or
          download the QR code to pay later.
        </p>

        <div id="qr-panel">
          <div id="qr-box" onClick={handleScanned} style={{ cursor: 'pointer' }} title="Click to simulate a scan">
            <QRCodeCanvas id="qr-image" value={payment.qrValue} size={200} includeMargin />
          </div>
          <p id="qr-hint">
            {scanned ? 'Payment received! Preparing your receipt...' : `${HINT[payment.method] || 'Scan to pay'} · waiting for payment...`}
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
            <span className="qr-info-value">{formatTime(secondsLeft)}</span>
          </div>
        </div>

        <button id="qr-download" onClick={handleDownload}>
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