import React from 'react'
import './ReceiptPopUp.css'

// "Oct 10, 2026 · 9:00 AM"
const formatDateTime = (iso) => {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${date} · ${time}`
}

const peso = (n) => `₱${Number(n || 0).toLocaleString()}`

const METHOD_NAME = { card: 'Credit / debit card', gcash: 'GCash', maya: 'Maya', bank: 'Bank transfer' }

// Saves the receipt as a small standalone page the customer can open or print
const downloadReceipt = (r) => {
  const row = (label, value) => `<tr><td>${label}</td><td style="text-align:right">${value}</td></tr>`
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Receipt ${r.code}</title>
<style>body{font-family:Arial,sans-serif;max-width:480px;margin:32px auto;color:#1b1b28}td{padding:6px 0}h1{margin-bottom:0}.m{color:#777;margin-top:4px}hr{border:0;border-top:1px solid #ddd}</style></head><body>
<h1>NexDrive receipt</h1><p class="m">Reference #${r.code} · ${r.paymentStatus}</p><hr>
<table width="100%">
${row('Vehicle', r.carName)}
${row('Pick-up', `${formatDateTime(r.pickupAt)}<br>${r.pickupLocation || ''}`)}
${row('Return', `${formatDateTime(r.returnAt)}<br>${r.returnLocation || ''}`)}
</table><hr><table width="100%">
${row(`Rental (${r.days} days × ${peso(r.price)})`, peso(r.rentalTotal))}
${row('Add-ons', peso(r.addonsTotal))}
${row('Service fee', peso(r.serviceFee))}
${row('<b>Booking total</b>', `<b>${peso(r.total)}</b>`)}
${row(`${r.paidLabel}${r.method ? ' via ' + (METHOD_NAME[r.method] || r.method) : ''}`, `<b>${peso(r.paidAmount)}</b>`)}
${row('Balance due at pick-up', peso(r.balance))}
</table><p class="m">Transaction ${r.txnId || ''} · ${formatDateTime(r.paidAt)}</p></body></html>`
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
  link.download = `receipt-${r.code}.html`
  link.click()
  URL.revokeObjectURL(link.href)
}

// receipt: { code, paymentStatus, carName, pickupAt, returnAt, pickupLocation, returnLocation, days, price,
//            rentalTotal, addonsTotal, serviceFee, total, paidLabel, paidAmount, balance, method, txnId, paidAt }
const ReceiptPopUp = ({ receipt, onClose, onDownload }) => {
  return (
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
              {receipt.days} {receipt.days === 1 ? 'day' : 'days'} × ₱{receipt.price.toLocaleString()}
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
          <span id="receipt-paid-label">{receipt.paidLabel}</span>
          <span id="receipt-paid-amount">₱{receipt.paidAmount.toLocaleString()}</span>
        </div>

        <div className="receipt-row">
          <span className="receipt-label">Balance due at pick-up</span>
          <span className="receipt-value">₱{receipt.balance.toLocaleString()}</span>
        </div>

        <button id="receipt-download" onClick={onDownload || (() => downloadReceipt(receipt))}>
          Download receipt
        </button>
      </div>
    </div>
  )
}

export default ReceiptPopUp