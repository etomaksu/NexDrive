import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import carImages from '../../data/carImages'

const sidebarLinks = [
  { to: '/dashboard', text: 'Overview' },
  { to: '/dashboard/bookings', text: 'My bookings' },
  { to: '/dashboard/profile', text: 'Profile' },
]


// ---------- helpers ----------
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })

const formatRange = (from, to) => `${formatDate(from)} - ${formatDate(to)}`

// dates relative to today, so the sample data never goes stale
const daysFromNow = (n, hour = 9) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

// ---------- sample data (replace with API data later) ----------
const STEPS = ['Booked', 'Confirmed', 'Pickup', 'Return']

const activeReservation = {
  id: 'r1',
  code: 'ND-1024',
  carName: 'Toyota Vios',
  status: 'Confirmed',
  branch: 'Imus, Cavite',
  pickupAt: daysFromNow(1),
  currentStep: 1,
  stepDates: [daysFromNow(-1), daysFromNow(0), daysFromNow(1), null],
}

const stats = [
  { label: 'Active bookings', value: 1, note: 'Pickup tomorrow' },
  { label: 'Total trips', value: 4, note: 'Since you joined' },
  { label: 'License', value: 'Verified', note: 'Ready to rent' },
]

const upcomingBookings = [
  {
    id: 'r1',
    carName: 'Toyota Vios',
    carImage: carImages.toyotavios,
    pickupAt: daysFromNow(1),
    returnAt: daysFromNow(3),
    location: 'Imus, Cavite',
    status: 'Confirmed',
  },
  {
    id: 'r2',
    carName: 'Mitsubishi Xpander',
    carImage: carImages.mitsubishixpander,
    pickupAt: daysFromNow(14),
    returnAt: daysFromNow(16),
    location: 'Imus, Cavite',
    status: 'Pending',
  },
]

const notifications = [
  { id: 1, title: 'Your Toyota Vios booking is confirmed', time: '2 hours ago' },
  { id: 2, title: 'Pickup reminder for tomorrow, 9:00 AM', time: 'Yesterday' },
]


const CustomerDashboard = ({user, onLogout}) => {
  const handleLogout = onLogout
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
          <h1 id="welcome-title">Welcome back, {user.firstName}</h1>

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