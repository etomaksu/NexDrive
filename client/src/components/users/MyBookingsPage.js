import React, { useState } from "react";
import { Link } from "react-router-dom";
import AccNavBar from "./src/components/users/AccNavBar"; // adjust the path/name to your nav component

// ---- sample data (replace with your real bookings) ----
const initialBookings = [
  { id: 1, code: "DE-1051", carName: "Toyota Fortuner", pickupAt: "2026-10-10", returnAt: "2026-10-13", location: "Imus branch", status: "Confirmed" },
  { id: 2, code: "DE-1022", carName: "Honda Civic", pickupAt: "2026-10-28", returnAt: "2026-11-02", location: "Imus branch", status: "Pending" },
  { id: 3, code: "DE-0987", carName: "Toyota Vios", pickupAt: "2026-08-04", returnAt: "2026-08-06", location: "Bacoor branch", status: "Completed" },
  { id: 4, code: "DE-0931", carName: "Mitsubishi Xpander", pickupAt: "2026-05-03", returnAt: "2026-05-05", location: "Imus branch", status: "Cancelled" },
];

// ---- helpers ----
const upcoming = (b) => b.status === "Confirmed" || b.status === "Pending";

const filters = {
  all: () => true,
  upcoming,
  completed: (b) => b.status === "Completed",
  cancelled: (b) => b.status === "Cancelled",
};

const tabDefs = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function formatRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const month = (d) => d.toLocaleDateString("en-PH", { month: "short" });
  return s.getMonth() === e.getMonth()
    ? `${month(s)} ${s.getDate()} – ${e.getDate()}`
    : `${month(s)} ${s.getDate()} – ${month(e)} ${e.getDate()}`;
}

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState(initialBookings);
  const [tab, setTab] = useState("all");

  const tabs = tabDefs.map((t) => ({
    ...t,
    count: bookings.filter(filters[t.key]).length,
  }));
  const visibleBookings = bookings.filter(filters[tab]);

  const handleReschedule = (id) => {
    console.log("reschedule", id); // TODO: open reschedule flow
  };

  const handleCancel = (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "Cancelled" } : b))
    );
  };

  return (
    <section id="my-bookings">
      <div className="profile-page">
        <div className="acc-navbar">
          <button type="button" className="back-btn">← Dashboard</button>
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
                {visibleBookings.map((b) => (
                  <tr key={b.id}>
                    <td>#{b.code}</td>
                    <td>{b.carName}</td>
                    <td>{formatRange(b.pickupAt, b.returnAt)}</td>
                    <td>{b.location}</td>
                    <td>
                      <span className={`badge ${b.status.toLowerCase()}`}>{b.status}</span>
                    </td>
                    <td>
                      <div className="actions">
                        {upcoming(b) && (
                          <>
                            <button type="button" className="action-btn" onClick={() => handleReschedule(b.id)}>
                              Reschedule
                            </button>
                            <button type="button" className="action-btn cancel" onClick={() => handleCancel(b.id)}>
                              Cancel
                            </button>
                          </>
                        )}

                        {b.status === "Completed" && (
                          <Link className="action-btn" to={`/dashboard/bookings/${b.id}/receipt`}>
                            Receipt
                          </Link>
                        )}

                        {b.status === "Cancelled" && (
                          <Link className="action-btn" to={`/dashboard/bookings/${b.id}`}>
                            Details
                          </Link>
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
    </section>
  );
};

export default MyBookingsPage;