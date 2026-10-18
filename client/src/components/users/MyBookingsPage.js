import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, message } from "antd";
import AccNavBar from "./AccNavBar"; // adjust the path/name to your nav component
import ReceiptPopUp from "./popups/ReceiptPopUp";
import { fetchMyBookings } from "../../api/bookings";
import { cancelBooking } from "../../api/account";
import {
  STATUS_LABEL, STATUS_CLASS, isUpcoming, isCompleted, isCancelled, canCancel, formatRange, toReceipt,
} from "./bookingUtils";
import './Accountpages.css'

const filters = {
  all: () => true,
  upcoming: isUpcoming,
  completed: isCompleted,
  cancelled: isCancelled,
};

const tabDefs = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    fetchMyBookings()
      .then(setBookings)
      .catch(() => setError("We could not load your bookings. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const tabs = tabDefs.map((t) => ({ ...t, count: bookings.filter(filters[t.key]).length }));
  const visibleBookings = bookings.filter(filters[tab]);

  const handleCancel = (b) => {
    Modal.confirm({
      title: `Cancel booking #${b.ref}?`,
      content: "This can't be undone.",
      okText: "Cancel booking",
      okButtonProps: { danger: true },
      cancelText: "Keep it",
      onOk: async () => {
        try {
          await cancelBooking(b.id);
          setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: "cancelled" } : x)));
          message.success(`Booking ${b.ref} cancelled`);
        } catch (err) {
          message.error(err.response?.data?.message || "Could not cancel the booking.");
        }
      },
    });
  };

  return (
    <section id="my-bookings">
      <div className="profile-page">
        <div className="acc-navbar">
          <AccNavBar current="/bookings" />
        </div>

        {/* ---------- MAIN ---------- */}
        <main id="bookings-main">
          <h1 id="bookings-title">My bookings</h1>

          <div id="bookings-tabs">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                className={tab === t.key ? "tab active" : "tab"}
                aria-pressed={tab === t.key}
                onClick={() => setTab(t.key)}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>

          <div id="bookings-table-card">
            <table id="bookings-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Vehicle</th>
                  <th>Dates</th>
                  <th>Pickup</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading && <tr><td colSpan={6}>Loading your bookings...</td></tr>}
                {!loading && error && <tr><td colSpan={6}>{error}</td></tr>}
                {!loading && !error && visibleBookings.length === 0 && (
                  <tr><td colSpan={6}>No bookings here yet.</td></tr>
                )}

                {visibleBookings.map((b) => (
                  <tr key={b.id}>
                    <td>#{b.ref}</td>
                    <td>{b.car ? b.car.name : "—"}</td>
                    <td>{formatRange(b.pickupAt, b.returnAt)}</td>
                    <td>{b.pickupLocation || "—"}</td>
                    <td>
                      <span className={`badge ${STATUS_CLASS[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                    </td>
                    <td>
                      <div className="actions">
                        {b.paidAmount > 0 && (
                          <button type="button" className="action-btn" onClick={() => setReceipt(toReceipt(b))}>
                            Receipt
                          </button>
                        )}
                        {canCancel(b) && (
                          <button type="button" className="action-btn cancel" onClick={() => handleCancel(b)}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {receipt && <ReceiptPopUp receipt={receipt} onClose={() => setReceipt(null)} />}
    </section>
  );
};

export default MyBookingsPage;