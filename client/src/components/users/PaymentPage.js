import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { fetchQuote, checkout, loadDraft, clearDraft } from "../../api/bookings";
import "./Payment-method.css";
import "./Payment-option.css";
import CardDetails from "./CardDetails"; // adjust if your CardDetails component lives elsewhere
import QRPaymentPopUp from "./popups/QRPaymentPopUp";
import ReceiptPopUp from "./popups/ReceiptPopUp";

// Where the customer lands after paying. Change it to your confirmation / bookings route.
const AFTER_PAYMENT_PATH = "/dashboard/bookings";

// e-wallets and bank transfer pay by scanning a QR code; cards go straight to the receipt
const QR_METHODS = ["gcash", "maya", "bank"];

const METHODS = [
  { value: "card", title: "Credit / debit card", sub: "Pay with Visa or Mastercard" },
  { value: "gcash", title: "GCash", sub: "Pay with your e-wallet" },
  { value: "maya", title: "Maya", sub: "Pay with your e-wallet" },
  { value: "bank", title: "Bank transfer", sub: "Pay using your trusted bank" },
];

const peso = (n) => `₱${Number(n || 0).toLocaleString()}`;

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // the booking comes from the booking page (kept in sessionStorage so a refresh doesn't lose it)
  const draft = location.state?.draft || loadDraft();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [method, setMethod] = useState("card");
  const [option, setOption] = useState("down"); // 'down' | 'full'
  const [paying, setPaying] = useState(false);
  const [qr, setQr] = useState(null);           // QR popup (gcash / maya / bank)
  const [receipt, setReceipt] = useState(null); // receipt popup, shown once the payment is recorded

  useEffect(() => {
    if (!draft) { setLoading(false); return; }
    fetchQuote(draft)
      .then(setInvoice)
      .catch((err) => setError(err.response?.data?.message || "Could not load this booking."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (error || !invoice) {
    return (
      <div className="checkoutPage">
        <button type="button" className="checkoutBack" onClick={() => navigate("/cars")}>← Back to cars</button>
        <p>{error || "There's no booking to pay for. Pick a car and your dates first."}</p>
      </div>
    );
  }

  const amountNow = option === "full" ? invoice.total : invoice.downpayment;

  // Records the payment (and creates the booking), then shows the receipt
  const completePayment = async () => {
    try {
      setPaying(true);
      const r = await checkout(draft, { option, method });
      clearDraft();
      setQr(null);
      setReceipt({
        code: r.ref,
        paymentStatus: "Paid",
        carName: r.carName,
        pickupAt: r.pickupAt,
        returnAt: r.returnAt,
        pickupLocation: r.pickupLocation,
        returnLocation: r.returnLocation,
        days: r.days,
        price: r.price,
        rentalTotal: r.rentalTotal,
        addonsTotal: r.addonsTotal,
        serviceFee: r.serviceFee,
        total: r.total,
        paidLabel: r.type === "full" ? "Full payment paid" : "Downpayment paid (50%)",
        paidAmount: r.paidAmount,
        balance: r.balance,
        method: r.method,
        txnId: r.txnId,
        paidAt: r.paidAt,
      });
    } catch (err) {
      setQr(null);
      message.error(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  const handlePay = () => {
    if (!QR_METHODS.includes(method)) return completePayment(); // card: straight to the receipt
    const reference = `NXD-${Date.now().toString(36).toUpperCase()}`;
    setQr({
      method,
      amount: amountNow,
      optionLabel: option === "full" ? "Full payment" : "Downpayment (50%)",
      carName: invoice.carName,
      reference,
      qrValue: `NEXDRIVE|${reference}|${amountNow}|${method}`,
    });
  };

  const closeReceipt = () => {
    setReceipt(null);
    navigate(AFTER_PAYMENT_PATH);
  };

  return (
    <div className="checkoutPage">
      <div>
        <div className="checkoutHeader">
          <button type="button" className="checkoutBack" onClick={() => navigate(-1)}>← Booking</button>
          <h1>Checkout</h1>
          <p>Step 3 of 3 • Secure Payment</p>
        </div>

        <div className="checkoutLayout">
          <div className="pay-stack">
            {/* PAYMENT METHOD */}
            <section className="pay-card">
              <fieldset className="payment-method">
                <legend>Payment method</legend>

                {METHODS.map((m) => (
                  <label className="option" key={m.value}>
                    <input
                      type="radio"
                      name="payment"
                      value={m.value}
                      checked={method === m.value}
                      onChange={(e) => setMethod(e.target.value)}
                    />
                    <span>
                      <span className="label-title">{m.title}</span>
                      <span className="label-sub">{m.sub}</span>
                    </span>
                  </label>
                ))}
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
                  <input
                    type="radio"
                    name="paymentOption"
                    value="down"
                    checked={option === "down"}
                    onChange={() => setOption("down")}
                  />
                  <span className="pay-option-text">
                    <span className="pay-option-title">Downpayment (50%)</span>
                    <span className="pay-option-sub">
                      Pay {peso(invoice.downpayment)} now · {peso(invoice.balance)} at pick-up
                    </span>
                  </span>
                  <span className="pay-option-price">{peso(invoice.downpayment)}</span>
                </label>

                <label className="pay-option">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="full"
                    checked={option === "full"}
                    onChange={() => setOption("full")}
                  />
                  <span className="pay-option-text">
                    <span className="pay-option-title">Full payment</span>
                    <span className="pay-option-sub">Pay the full {peso(invoice.total)} now</span>
                  </span>
                  <span className="pay-option-price">{peso(invoice.total)}</span>
                </label>
              </fieldset>

              <div className="pay-amount">
                <label className="pay-amount-label" htmlFor="amountNow">Amount to pay now</label>
                <div className="pay-amount-field">
                  <input id="amountNow" type="text" value={peso(amountNow)} readOnly />
                  <span className="pay-badge">
                    <LockOutlined />
                    {option === "full" ? "Full amount" : "50% · fixed"}
                  </span>
                </div>
                <p className="pay-note">
                  {option === "full"
                    ? "Nothing left to pay at pick-up."
                    : `Remaining ${peso(invoice.balance)} is payable at pick-up.`}
                </p>
              </div>
            </section>

            {/* CARD DETAILS (only for card payments) */}
            {method === "card" && <CardDetails />}
          </div>

          {/* INVOICE */}
          <aside className="invoiceCard">
            <h2 className="invoiceTitle">Invoice</h2>

            <div className="invoiceLines">
              <div className="invoiceLine">
                <span>{invoice.carName} · {invoice.days} {invoice.days === 1 ? "day" : "days"}</span>
                <span>{peso(invoice.rentalTotal)}</span>
              </div>
              <div className="invoiceLine">
                <span>Add-ons</span>
                <span>{peso(invoice.addonsTotal)}</span>
              </div>
              <div className="invoiceLine">
                <span>Service fee</span>
                <span>{peso(invoice.serviceFee)}</span>
              </div>
            </div>

            <div className="invoiceTotal">
              <span>Total</span>
              <strong>{peso(invoice.total)}</strong>
            </div>
            <div className="invoiceDue">
              <span>Due now {option === "full" ? "(100%)" : "(50%)"}</span>
              <span>{peso(amountNow)}</span>
            </div>
            <div className="invoiceBalance">
              <span>Balance due at pick-up</span>
              <span>{peso(option === "full" ? 0 : invoice.balance)}</span>
            </div>

            <button type="button" className="payBtn" onClick={handlePay} disabled={paying || Boolean(qr) || Boolean(receipt)}>
              {paying
                ? "Processing..."
                : option === "full"
                ? `Pay ${peso(amountNow)} in full`
                : `Pay ${peso(amountNow)} downpayment`}
            </button>
            <p className="invoiceSecure">Your payment is encrypted and secure.</p>
          </aside>
        </div>
      </div>

      {qr && <QRPaymentPopUp payment={qr} onClose={() => setQr(null)} onPaid={completePayment} />}
      {receipt && <ReceiptPopUp receipt={receipt} onClose={closeReceipt} />}
    </div>
  );
};

export default PaymentPage;