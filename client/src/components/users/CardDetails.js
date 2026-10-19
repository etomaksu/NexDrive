import React from 'react'
import './CardDetails.css'

const CardDetails = () => {
  return (
    <form className="pay-card card-details-form" id="card-form">
        <h2 className="card-details-title">Card details</h2>

        <div className="card-details">
          <div className="cd-field cd-wide">
            <label htmlFor="cardNumber">Card number</label>
            <input
              id="cardNumber"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
            />
          </div>

          <div className="cd-field">
            <label htmlFor="cardExpiry">Expiry</label>
            <input
              id="cardExpiry"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM / YY"
            />
          </div>

          <div className="cd-field">
            <label htmlFor="cardName">Name on card</label>
            <input
              id="cardName"
              type="text"
              maxLength={50}
              autoComplete="cc-name"
              placeholder="Name on card"
            />
          </div>

          <div className="cd-field">
            <label htmlFor="cardCvv">CVV</label>
            <input
              id="cardCvv"
              type="password"
              inputMode="numeric"
              maxLength={4}
              autoComplete="cc-csc"
              placeholder="123"
            />
          </div>

          <label className="cd-save">
            <input type="checkbox" />
            Save this card for future bookings
          </label>
        </div>
      </form>
  )
}

export default CardDetails
