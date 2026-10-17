import React from 'react'
import { Link } from "react-router-dom";

const BookingConfirmPage = () => {
  return (
    <div>
        <main className="confirmed">
      <div className="confirmed-icon">
      </div>
 
      <h1 className="confirmed-title">Booking confirmed</h1>
      <p className="confirmed-sub">
        Reference #DE-1051 · A copy was sent to your email
      </p>
 
      <section className="receipt" aria-labelledby="receipt-title">
        <h2 id="receipt-title">Receipt</h2>
 
        <dl className="receipt-rows">
          <div className="receipt-row">
            <dt>Vehicle</dt>
            <dd>Toyota Fortuner</dd>
          </div>
          <div className="receipt-row">
            <dt>Pick-up</dt>
            <dd>Oct 10, 2026 · 9:00 AM · Imus, Cavite</dd>
          </div>
          <div className="receipt-row">
            <dt>Return</dt>
            <dd>Oct 13, 2026 · 9:00 AM · Manila Airport T3</dd>
          </div>
          <div className="receipt-row">
            <dt>Rental (3 days)</dt>
            <dd>₱10,500</dd>
          </div>
          <div className="receipt-row">
            <dt>Add-ons</dt>
            <dd>₱1,950</dd>
          </div>
          <div className="receipt-row">
            <dt>Service fee</dt>
            <dd>₱200</dd>
          </div>
        </dl>
 
        <dl className="receipt-total">
          <dt>Total paid</dt>
          <dd>₱12,650</dd>
        </dl>
      </section>
 
      <div className="confirmed-actions">
        <button type="button" className="btn-primary">Download receipt</button>
        <Link to="/bookings" className="btn-secondary">View my bookings</Link>
      </div>
    </main>
    </div>
  )
}

export default BookingConfirmPage
