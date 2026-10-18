import React, { useState } from "react";
import "./src/components/users/Payment-method.css";
import "./src/components/users/Payment-option.css";
import CardDetails from "./components/CardDetails";
import { LockOutlined } from '@ant-design/icons'

const PaymentPage = () => {
  const [method, setMethod] = useState("card");

  return (
      <div className="checkoutPage">
    <div>
      <div className="checkoutHeader">
        <button type="button" className="checkoutBack">← Booking</button>
        <h1>Checkout</h1>
        <p>Step 3 of 3 • Secure Payment</p>
      </div>

      <div className="checkoutLayout">
        <div className="pay-stack">
          {/* PAYMENT METHOD */}
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

          {/* PAYMENT OPTION */}
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
                  <span className="pay-option-sub">
                    Pay ₱{invoice.downpayment.toLocaleString()} now · ₱
                    {invoice.balance.toLocaleString()} at pick-up
                  </span>
                </span>
                <span className="pay-option-price">
                  ₱{invoice.downpayment.toLocaleString()}
                </span>
              </label>

              <label className="pay-option">
                <input type="radio" name="paymentOption" value="full" />
                <span className="pay-option-text">
                  <span className="pay-option-title">Full payment</span>
                  <span className="pay-option-sub">
                    Pay the full ₱{invoice.total.toLocaleString()} now
                  </span>
                </span>
                <span className="pay-option-price">
                  ₱{invoice.total.toLocaleString()}
                </span>
              </label>
            </fieldset>

            <div className="pay-amount">
              <label className="pay-amount-label" htmlFor="amountNow">
                Amount to pay now
              </label>
              <div className="pay-amount-field">
                <input
                  id="amountNow"
                  type="text"
                  value={`₱${invoice.downpayment.toLocaleString()}`}
                  readOnly
                />
                <span className="pay-badge">
                  <LockOutlined />
                  50% · fixed
                </span>
              </div>
              <p className="pay-note">
                Remaining ₱{invoice.balance.toLocaleString()} is payable at pick-up.
              </p>
            </div>
          </section>

          {/* CARD DETAILS (only for card payments) */}
          {method === "card" && <CardDetails />}
        </div>

        {/* INVOICE */}
        <aside className="invoiceCard">
          <h2 className="invoiceTitle">Invoice #{invoice.code}</h2>

          <div className="invoiceLines">
            <div className="invoiceLine">
              <span>{invoice.carName} · {invoice.days} days</span>
              <span>₱{invoice.rentalTotal.toLocaleString()}</span>
            </div>
            <div className="invoiceLine">
              <span>Add-ons</span>
              <span>₱{invoice.addonsTotal.toLocaleString()}</span>
            </div>
            <div className="invoiceLine">
              <span>Service fee</span>
              <span>₱{invoice.serviceFee.toLocaleString()}</span>
            </div>
          </div>

          <div className="invoiceTotal">
            <span>Total</span>
            <strong>₱{invoice.total.toLocaleString()}</strong>
          </div>
          <div className="invoiceDue">
            <span>Due now (50%)</span>
            <span>₱{invoice.downpayment.toLocaleString()}</span>
          </div>
          <div className="invoiceBalance">
            <span>Balance due at pick-up</span>
            <span>₱{invoice.balance.toLocaleString()}</span>
          </div>

          <button type="button" className="payBtn">
            Pay ₱{invoice.downpayment.toLocaleString()} downpayment
          </button>
          <p className="invoiceSecure">Your payment is encrypted and secure.</p>
        </aside>
      </div>
    </div>
  </div>
  );
};

export default PaymentPage;