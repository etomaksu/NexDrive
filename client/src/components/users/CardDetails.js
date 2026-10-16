import React from 'react'

const CardDetails = () => {
  return (
    <div>
      <form className="card-details-form">
        <h1> Card Details</h1>
        <div className="card-details">
            <label>Card Number</label>
            <input type="text" placeholder="12344 5678 9100 2346" />

            <label>Cardholder Name</label>
            <input type="text" placeholder="Max of 50 characters" />

            <label>Expiration Date</label>
            <input type="text" placeholder="00/00" />

            <label>CVV</label>
            <input type="text" placeholder="123" />
        </div>
      </form>
    </div>
  )
}

export default CardDetails
