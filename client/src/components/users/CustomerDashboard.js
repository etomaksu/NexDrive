import React, { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { fetchMyBookings } from '../../api/bookings'
import { fetchProfile } from '../../api/account'
import {
  carImageSrc, STATUS_LABEL, STATUS_CLASS, isUpcoming, isCompleted,
  formatDate, formatTime, formatRange, timeAgo, daysUntil,
} from './bookingUtils'
import './CustomerDashboard.css'

const sidebarLinks = [
  { to: '/dashboard', text: 'Dashboard' },
  { to: '/dashboard/bookings', text: 'My Bookings' },
  { to: '/dashboard/profile', text: 'Profile' },
]

const STEPS = ['Booked', 'Confirmed', 'Pickup', 'Return']

// where the tracker is: steps before it are done, this one is the current one
const CURRENT_STEP = { requested: 1, approved: 2, active: 3 }

const historyDate = (b, status) => {
  const h = (b.history || []).find((x) => x.status === status)
  return h ? h.at : null
}

const pickupNote = (b) => {
  if (b.status === 'active') return `Return ${formatDate(b.returnAt)}`
  if (b.status === 'requested') return 'Waiting for approval'
  const d = daysUntil(b.pickupAt)
  if (d <= 0) return 'Pickup today'
  if (d === 1) return 'Pickup tomorrow'
  return `Pickup in ${d} days`
}

const LICENSE_STAT = {
  verified: { value: 'Verified', note: 'Ready to rent' },
  pending: { value: 'Pending', note: 'Under review' },
  rejected: { value: 'Rejected', note: 'Upload a new license' },
  none: { value: 'Not uploaded', note: 'Add it in Profile' },
}

const welcomeText = (b) => {
  const car = b.car ? b.car.name : 'car'
  if (b.status === 'requested') return `Your ${car} booking is waiting for approval.`
  if (b.status === 'active') return `Enjoy your ${car}! Return it on ${formatDate(b.returnAt)} at ${formatTime(b.returnAt)}.`
  return `Your ${car} is ready for pickup on ${formatDate(b.pickupAt)} at ${formatTime(b.pickupAt)}${b.pickupLocation ? `, ${b.pickupLocation}` : ''}.`
}

// Notifications are built from what happened to the customer's bookings
const buildNotifications = (bookings) => {
  const list = []
  const MESSAGE = {
    requested: (car, b) => `Booking ${b.ref} received for your ${car}`,
    approved: (car) => `Your ${car} booking is confirmed`,
    rejected: (car) => `Your ${car} booking was declined`,
    active: (car) => `Keys handed over for your ${car}`,
    returned: (car) => `Thanks for renting the ${car}`,
    cancelled: (car) => `Your ${car} booking was cancelled`,
  }
  bookings.forEach((b) => {
    const car = b.car ? b.car.name : 'car'
    ;(b.history || []).forEach((h) => {
      if (MESSAGE[h.status]) list.push({ id: `${b.id}-${h.status}`, title: MESSAGE[h.status](car, b), at: h.at })
    })
    if (b.status === 'approved' && daysUntil(b.pickupAt) <= 1 && daysUntil(b.pickupAt) >= 0) {
      const when = daysUntil(b.pickupAt) === 0 ? 'today' : 'tomorrow'
      list.push({ id: `${b.id}-reminder`, title: `Pickup reminder for ${when}, ${formatTime(b.pickupAt)}`, at: new Date().toISOString() })
    }
  })
  return list.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 4)
}

const CustomerDashboard = ({ user, onLogout }) => {
  const [bookings, setBookings] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([fetchMyBookings(), fetchProfile()])
      .then(([b, p]) => { setBookings(b); setProfile(p) })
      .catch(() => setError('We could not load your bookings. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  // the booking to feature: the nearest one that hasn't finished
  const live = bookings.filter(isUpcoming).sort((a, b) => new Date(a.pickupAt) - new Date(b.pickupAt))
  const activeReservation = live[0]
  const currentStep = activeReservation ? CURRENT_STEP[activeReservation.status] : 0
  const stepDates = activeReservation
    ? [historyDate(activeReservation, 'requested') || activeReservation.createdAt, historyDate(activeReservation, 'approved'), activeReservation.pickupAt, activeReservation.returnAt]
    : []

  const license = LICENSE_STAT[(profile && profile.license && profile.license.status) || 'none']
  const stats = [
    { label: 'Active bookings', value: live.length, note: activeReservation ? pickupNote(activeReservation) : 'No active bookings' },
    { label: 'Total trips', value: bookings.filter(isCompleted).length, note: 'Completed rentals' },
    { label: 'License', value: license.value, note: license.note },
  ]

  const notifications = buildNotifications(bookings)

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
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              {link.text}
            </NavLink>
          ))}
        </nav>

        <hr id="sidebar-divider" />

        <button id="logout-btn" onClick={onLogout}>
          Log out
        </button>
      </aside>

      {/* ---------- MAIN ---------- */}
      <main id="dashboard-main">
        {/* Welcome */}
        <div id="welcome">
          <h1 id="welcome-title">Welcome back, {user.firstName}</h1>

          {error && <p id="welcome-text">{error}</p>}
          {!error && !loading && (
            <p id="welcome-text">
              {activeReservation ? welcomeText(activeReservation) : 'You have no active bookings. Ready for your next trip?'}
            </p>
          )}

          <div id="welcome-actions">
            {activeReservation && (
              <Link id="view-booking-btn" to="/dashboard/bookings">
                View booking
              </Link>
            )}
            <Link id="book-another-btn" to="/cars">
              {activeReservation ? 'Book another car' : 'Book a car'}
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div id="stats">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{loading ? '–' : stat.value}</span>
              <span className="stat-note">{loading ? '' : stat.note}</span>
            </div>
          ))}
        </div>

        {/* Reservation tracker */}
        {activeReservation && (
          <div className="card" id="tracker-card">
            <div id="tracker-header">
              <h2 id="tracker-title">
                Reservation #{activeReservation.ref} · {activeReservation.car ? activeReservation.car.name : ''}
              </h2>
              <span className={`badge ${STATUS_CLASS[activeReservation.status]}`}>
                {STATUS_LABEL[activeReservation.status]}
              </span>
            </div>

            <div id="tracker">
              {STEPS.map((step, i) => {
                const state = i < currentStep ? 'done' : i === currentStep ? 'current' : 'upcoming'

                return (
                  <React.Fragment key={step}>
                    <div className="step">
                      <span className={`step-circle ${state}`} />
                      <span className="step-label">{step}</span>
                      <span className="step-date">{stepDates[i] ? formatDate(stepDates[i]) : ''}</span>
                    </div>

                    {i < STEPS.length - 1 && (
                      <span className={i < currentStep ? 'line filled' : 'line'} />
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

            {!loading && live.length === 0 && <p className="booking-meta">Nothing booked yet.</p>}

            {live.slice(0, 3).map((booking) => (
              <div className="booking-row" key={booking.id}>
                <img src={carImageSrc(booking.car)} alt={booking.car ? booking.car.name : ''} />

                <div className="booking-info">
                  <span className="booking-name">{booking.car ? booking.car.name : 'Car'}</span>
                  <span className="booking-meta">
                    {formatRange(booking.pickupAt, booking.returnAt)}
                    {booking.pickupLocation ? ` · ${booking.pickupLocation}` : ''}
                  </span>
                </div>

                <span className={`badge ${STATUS_CLASS[booking.status]}`}>
                  {STATUS_LABEL[booking.status]}
                </span>

                <Link className="view-btn" to="/dashboard/bookings">
                  View
                </Link>
              </div>
            ))}
          </div>

          <div className="card" id="notifications-card">
            <h2 className="card-title">Notifications</h2>

            {!loading && notifications.length === 0 && <p className="booking-meta">No notifications yet.</p>}

            {notifications.map((n) => (
              <div className="notification" key={n.id}>
                <span className="notification-title">{n.title}</span>
                <span className="notification-time">{timeAgo(n.at)}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </section>
  )
}

export default CustomerDashboard