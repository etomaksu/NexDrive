import React from 'react'

const MyBookingsPage = () => {
  return (
    <div>
            <section id="my-bookings">
        {/* ---------- SIDEBAR ---------- */}
        <aside id="sidebar">
        <nav>
            {sidebarLinks.map((link) => (
            <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/dashboard'}
                className={({ isActive }) =>
                isActive ? 'sidebar-link active' : 'sidebar-link'
                }
            >
                {link.text}
            </NavLink>
            ))}
        </nav>

        <hr id="sidebar-divider" />

        <button id="logout-btn" onClick={handleLogout}>
            Log out
        </button>
        </aside>

        {/* ---------- MAIN ---------- */}
        <main id="bookings-main">
        <h1 id="bookings-title">My bookings</h1>

        <div id="bookings-tabs">
            {tabs.map((t) => (
            <button
                key={t.key}
                className={tab === t.key ? 'tab active' : 'tab'}
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
                        {(b.status === 'Confirmed' || b.status === 'Pending') && (
                        <>
                            <button className="action-btn" onClick={() => handleReschedule(b.id)}>
                            Reschedule
                            </button>
                            <button className="action-btn cancel" onClick={() => handleCancel(b.id)}>
                            Cancel
                            </button>
                        </>
                        )}

                        {b.status === 'Completed' && (
                        <Link className="action-btn" to={`/dashboard/bookings/${b.id}/receipt`}>
                            Receipt
                        </Link>
                        )}

                        {b.status === 'Cancelled' && (
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
    </section>
    </div>
  )
}

export default MyBookingsPage
