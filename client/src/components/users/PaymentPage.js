import React, { useState } from "react";
import "./payment-method.css";
import "./payment-option.css";
import CardDetails from "./components/CardDetails";

const PaymentPage = () => {
  const [method, setMethod] = useState("card");

  return (
    <div>
      <div>
        <div>
          <button type="button">Booking</button>
          <h1>Checkout</h1>
          <p>Step 3 of 3 • Secure Payment</p>
        </div>

        <div className="pay-stack">
        <section className="pay-card">
        <fieldset className="payment-method">
          <legend>Payment method</legend>

          <label className="option">
            <input
              type="radio"
              name="payment"
              value="card"
              checked={method === "card"}
              onChange={(e) => setMethod(e.target.value)}
            />
            <span>
              <span className="label-title">Credit / debit card</span>
              <span className="label-sub">Visa ending 4417</span>
            </span>
          </label>

          <label className="option">
            <input
              type="radio"
              name="payment"
              value="gcash"
              checked={method === "gcash"}
              onChange={(e) => setMethod(e.target.value)}
            />
            <span>
              <span className="label-title">GCash</span>
              <span className="label-sub">Pay with your e-wallet</span>
            </span>
          </label>

          <label className="option">
            <input
              type="radio"
              name="payment"
              value="maya"
              checked={method === "maya"}
              onChange={(e) => setMethod(e.target.value)}
            />
            <span>
              <span className="label-title">Maya</span>
              <span className="label-sub">Pay with your e-wallet</span>
            </span>
          </label>

          <label className="option">
            <input
              type="radio"
              name="payment"
              value="bank"
              checked={method === "bank"}
              onChange={(e) => setMethod(e.target.value)}
            />
            <span>
              <span className="label-title">Bank transfer</span>
              <span className="label-sub">Pay using your trusted bank</span>
            </span>
          </label>
        </fieldset>
        </section>

        <section className="pay-card">
          <fieldset className="pay-group" aria-describedby="pay-desc">
            <legend className="pay-title">Payment option</legend>
            <p className="pay-desc" id="pay-desc">
              Pay a 50% downpayment now, or settle the full amount.
            </p>

            <label className="pay-option">
              <input type="radio" name="paymentOption" value="down" defaultChecked />
              <span className="pay-option-text">
                <span className="pay-option-title">Downpayment (50%)</span>
                <span className="pay-option-sub">Pay ₱6,325 now · ₱6,325 at pick-up</span>
              </span>
              <span className="pay-option-price">₱6,325</span>
            </label>

            <label className="pay-option">
              <input type="radio" name="paymentOption" value="full" />
              <span className="pay-option-text">
                <span className="pay-option-title">Full payment</span>
                <span className="pay-option-sub">Pay the full ₱12,650 now</span>
              </span>
              <span className="pay-option-price">₱12,650</span>
            </label>
          </fieldset>

          <div className="pay-amount">
            <label className="pay-amount-label" htmlFor="amountNow">
              Amount to pay now
            </label>
            <div className="pay-amount-field">
              <input id="amountNow" type="text" value="" readOnly />
              <span className="pay-badge">
                50% · fixed
              </span>
            </div>
            <p className="pay-note">Remaining ₱6,325 is payable at pick-up.</p>
          </div>
        </section>

        {method === "card" && <CardDetails />}
        </div>
      </div>
    </div>
  );//mm
};

export default PaymentPage;