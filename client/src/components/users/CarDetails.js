import { Tag, Button } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import { fetchCar } from '../../api/cars'
import { fetchAvailability } from '../../api/bookings'
import './CarDetails.css'

const STATUS_TAG = {
  available: { color: 'green', label: 'Available' },
  rented: { color: 'blue', label: 'Rented' },
  maintenance: { color: 'red', label: 'Maintenance' },
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December']

const pad = (n) => String(n).padStart(2, '0')
const toIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return toIso(d) }

// ["2026-10-14".."2026-10-19"] -> every day in between, as "YYYY-MM-DD" strings
const expandRange = ({ from, to }) => {
  const days = []
  const cur = new Date(`${from}T00:00:00`)
  const end = new Date(`${to}T00:00:00`)
  while (cur <= end) { days.push(toIso(cur)); cur.setDate(cur.getDate() + 1) }
  return days
}

const CarDetails = () => {
  const { carId } = useParams()
  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pickup, setPickup] = useState(addDays(1))
  const [returnDate, setReturnDate] = useState(addDays(4))
  const [bookedDays, setBookedDays] = useState(new Set())

  const loadAvailability = () =>
    fetchAvailability(carId)
      .then((ranges) => setBookedDays(new Set(ranges.flatMap(expandRange))))
      .catch(() => setBookedDays(new Set()))

  useEffect(() => {
    fetchCar(carId)
      .then(setCar)
      .catch(() => setCar(null))
      .finally(() => setLoading(false))
    loadAvailability()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carId])

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>

  if (!car) {
    return (
      <div className="carDetailsPage">
        <button className="backBtn" onClick={() => navigate('/cars')}>
          ← Back to cars
        </button>
        <p>We couldn't find that car.</p>
      </div>
    )
  }

  // The calendar shows the month of the pick-up date
  const [year, month] = (pickup || addDays(1)).split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const dayKey = (d) => `${year}-${pad(month)}-${pad(d)}`

  const today = toIso(new Date())
  const invalidRange = !pickup || !returnDate || returnDate < pickup || pickup < today
  const conflict = !invalidRange && expandRange({ from: pickup, to: returnDate }).some((d) => bookedDays.has(d))
  const inRange = (d) => !invalidRange && dayKey(d) >= pickup && dayKey(d) <= returnDate
  const unavailable = car.status === 'maintenance'

  // Step 2: the booking page (trip details + add-ons). The reservation is saved from there.
  const handleReserve = () => {
    navigate(`/cars/${carId}/book?pickup=${pickup}&return=${returnDate}`)
  }

  const specs = [
    { label: 'Type', value: car.type },
    { label: 'Transmission', value: car.transmission },
    { label: 'Seats', value: car.seats },
    { label: 'Fuel', value: car.fuel },
    { label: 'Luggage', value: `${car.luggage ?? 0} bags` },
    { label: 'Year', value: car.year },
    { label: 'Doors', value: car.doors },
    { label: 'Mileage', value: `${(car.mileage ?? 0).toLocaleString()} km` },
  ]

  const tag = STATUS_TAG[car.status] || STATUS_TAG.available

  return (
    <div className="carDetailsPage">
      <button className="backBtn" onClick={() => navigate('/cars')}>
        ← Back to cars
      </button>

      <nav className="breadcrumb">
        <span>Cars</span> / <span>{car.type}</span> / <span>{car.name}</span>
      </nav>

      <div className="detailsTitleRow">
        <h1 className="detailsTitle">{car.name}</h1>
        <Tag color={tag.color} bordered={false}>{tag.label}</Tag>
      </div>

      <div className="detailsLayout">
        {/* LEFT: image + specs */}
        <div className="detailsMain">
          <div className="detailsImageWrap">
            <img className="detailsImage" src={car.image} alt={car.name} />
          </div>

          <section className="specsCard">
            <h2 className="specsTitle">Specifications</h2>
            <div className="specsGrid">
              {specs.map((spec) => (
                <div className="specItem" key={spec.label}>
                  <span className="specLabel">{spec.label}</span>
                  <span className="specValue">{spec.value}</span>
                </div>
              ))}
            </div>
            <p className="specsDescription">{car.description}</p>
          </section>
        </div>

        {/* RIGHT: booking panel */}
        <aside className="bookingCard">
          <div className="bookingPrice">
            <span className="bookingAmount">₱{car.price.toLocaleString()}</span>
            <span className="bookingUnit"> / day</span>
          </div>

          <div className="bookingDates">
            <label>
              <span>Pick-up</span>
              <input
                type="date"
                value={pickup}
                min={today}
                onChange={(e) => setPickup(e.target.value)}
              />
            </label>
            <label>
              <span>Return</span>
              <input
                type="date"
                value={returnDate}
                min={pickup}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </label>
          </div>

          <h3 className="availabilityTitle">Availability · {MONTH_NAMES[month - 1]} {year}</h3>
          <div className="calendarGrid">
            {days.map((d) => {
              const isBooked = bookedDays.has(dayKey(d))
              return (
                <div
                  key={d}
                  className={
                    'calendarDay ' +
                    (isBooked ? 'booked' : 'free') +
                    (inRange(d) ? ' selected' : '')
                  }
                  aria-label={`${MONTH_NAMES[month - 1]} ${d}, ${isBooked ? 'booked' : 'available'}`}
                >
                  {d}
                </div>
              )
            })}
          </div>

          <div className="calendarLegend">
            <span className="legendChip free">Available</span>
            <span className="legendChip booked">Booked</span>
          </div>

          {invalidRange && (
            <p className="bookingNote">Pick a future pick-up date, and a return date on or after it.</p>
          )}
          {conflict && (
            <p className="bookingNote">Some of the days you picked are already booked.</p>
          )}
          {unavailable && (
            <p className="bookingNote">This car is under maintenance right now.</p>
          )}

          <Button
            type="primary"
            block
            className="reserveBtn"
            disabled={invalidRange || conflict || unavailable}
            onClick={handleReserve}
          >
            Reserve now
          </Button>
        </aside>
      </div>
    </div>
  )
}

export default CarDetails