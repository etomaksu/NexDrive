import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

// the five steps of a reservation, in order
const STEPS = ['Requested', 'Approved', 'Pickup', 'Return', 'Completed']

const sidebarLinks = [
  { text: 'Dashboard', to: '/dashboard' },
  { text: 'My Bookings', to: '/dashboard/bookings' },
  { text: 'Payments', to: '/dashboard/payments' },
  { text: 'Profile', to: '/dashboard/profile' },
  { text: 'Notifications', to: '/dashboard/notifications' },
]

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

// "Oct 10 – 13" if same month, otherwise "Oct 28 – Nov 2"
const formatRange = (start, end) => {
  const s = new Date(start)
  const e = new Date(end)
  const sameMonth = s.getMonth() === e.getMonth()
  return sameMonth
    ? `${formatDate(start)} – ${e.getDate()}`
    : `${formatDate(start)} – ${formatDate(end)}`
}

const CustomerDashboard = () => {
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard', { credentials: 'include' })
        if (!res.ok) throw new Error('Could not load your dashboard')
        setData(await res.json())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const handleLogout = () => {
    // clear your token / call your logout endpoint here
    navigate('/login')
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>
  if (!data) return null

  const { user, activeReservation, stats, upcomingBookings, notifications } = data

  return (
    <section id="dashboard">
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
      <main id="dashboard-main">
        {/* Welcome */}
        <div id="welcome">
          <h1 id="welcome-title">Welcome back, {user.name}</h1>

          {activeReservation && (
            <p id="welcome-text">
              Your {activeReservation.carName} is ready for pickup on{' '}
              {formatDate(activeReservation.pickupAt)} at{' '}
              {formatTime(activeReservation.pickupAt)}, {activeReservation.branch}.
            </p>
          )}

          <div id="welcome-actions">
            {activeReservation && (
              <Link
                id="view-booking-btn"
                to={`/dashboard/bookings/${activeReservation.id}`}
              >
                View booking
              </Link>
            )}
            <Link id="book-another-btn" to="/cars">
              Book another car
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div id="stats">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-note">{stat.note}</span>
            </div>
          ))}
        </div>

        {/* Reservation tracker */}
        {activeReservation && (
          <div className="card" id="tracker-card">
            <div id="tracker-header">
              <h2 id="tracker-title">
                Reservation #{activeReservation.code} · {activeReservation.carName}
              </h2>
              <span className={`badge ${activeReservation.status.toLowerCase()}`}>
                {activeReservation.status}
              </span>
            </div>

            <div id="tracker">
              {STEPS.map((step, i) => {
                const state =
                  i < activeReservation.currentStep
                    ? 'done'
                    : i === activeReservation.currentStep
                    ? 'current'
                    : 'upcoming'

                return (
                  <React.Fragment key={step}>
                    <div className="step">
                      <span className={`step-circle ${state}`} />
                      <span className="step-label">{step}</span>
                      <span className="step-date">
                        {activeReservation.stepDates[i]
                          ? formatDate(activeReservation.stepDates[i])
                          : ''}
                      </span>
                    </div>

                    {i < STEPS.length - 1 && (
                      <span
                        className={
                          i < activeReservation.currentStep ? 'line filled' : 'line'
                        }
                      />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        )}

        {/* Upcoming bookings + notifications */}
        <div id="bottom-row">
          <div className="card" id="upcoming-card">
            <h2 className="card-title">Upcoming bookings</h2>

            {upcomingBookings.map((booking) => (
              <div className="booking-row" key={booking.id}>
                <img src={booking.carImage} alt={booking.carName} />

                <div className="booking-info">
                  <span className="booking-name">{booking.carName}</span>
                  <span className="booking-meta">
                    {formatRange(booking.pickupAt, booking.returnAt)} · {booking.location}
                  </span>
                </div>

                <span className={`badge ${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>

                <Link className="view-btn" to={`/dashboard/bookings/${booking.id}`}>
                  View
                </Link>
              </div>
            ))}
          </div>

          <div className="card" id="notifications-card">
            <h2 className="card-title">Notifications</h2>

            {notifications.map((n) => (
              <div className="notification" key={n.id}>
                <span className="notification-title">{n.title}</span>
                <span className="notification-time">{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </section>
  )
}

export default CustomerDashboard