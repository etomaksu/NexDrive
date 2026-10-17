import { Tag, Button, message } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import { fetchCar } from '../../api/cars'
//import './CarDetails.css'
//changes
// Booked days in October 2026, per car id.
// Replace this with real booking data later (API / database).
const bookedByCar = {
  1: [2, 3, 14, 15, 27],
  2: [8, 9, 10, 25],
  3: [1, 2, 17, 18, 19],
  4: [6, 7, 21, 22, 30],
  5: [11, 12, 26],
  6: [4, 5, 18, 19, 20],
  7: [13, 14, 15, 28, 29],
  8: [4, 5, 6, 12, 13, 20, 21, 22],
  9: [9, 10, 23, 24],
}

const YEAR = 2026
const MONTH = 10 // October
const DAYS_IN_MONTH = new Date(YEAR, MONTH, 0).getDate()

// "2026-10-10" -> 10 (only if the date is inside October 2026)
const dayOfOctober = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return y === YEAR && m === MONTH ? d : null
}

const CarDetails = () => {
  const { carId } = useParams()
  const [car, setCar] = useState(null)
  const navigate = useNavigate()
  const [pickup, setPickup] = useState('2026-10-10')
  const [returnDate, setReturnDate] = useState('2026-10-13')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCar(carId)
    .then(setCar)
    .catch(() => setCar(null))
    .finally(() =>setLoading(false))
  },[carId])

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

  const booked = bookedByCar[car.id] || []
  const days = Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1)

  // selected range (only days inside October are checked against the calendar)
  const startDay = dayOfOctober(pickup)
  const endDay = dayOfOctober(returnDate)
  const invalidRange = !pickup || !returnDate || returnDate < pickup
  const conflict =
    !invalidRange &&
    startDay !== null &&
    endDay !== null &&
    booked.some((d) => d >= startDay && d <= endDay)

  const inRange = (d) => !invalidRange && startDay && endDay && d >= startDay && d <= endDay

  const handleReserve = () => {
    message.success(`${car.name} reserved: ${pickup} to ${returnDate}`)
  }

  const specs = [
    { label: 'Type', value: car.type },
    { label: 'Transmission', value: car.transmission },
    { label: 'Seats', value: car.seats },
    { label: 'Fuel', value: car.fuel },
    { label: 'Luggage', value: `${car.luggage} bags` },
    { label: 'Year', value: car.year },
    { label: 'Doors', value: car.doors },
    { label: 'Mileage', value: `${car.mileage.toLocaleString()} km` },
  ]

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
        <Tag color="green" bordered={false}>Available</Tag>
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

          <h3 className="availabilityTitle">Availability · October {YEAR}</h3>
          <div className="calendarGrid">
            {days.map((d) => {
              const isBooked = booked.includes(d)
              return (
                <div
                  key={d}
                  className={
                    'calendarDay ' +
                    (isBooked ? 'booked' : 'free') +
                    (inRange(d) ? ' selected' : '')
                  }
                  aria-label={`October ${d}, ${isBooked ? 'booked' : 'available'}`}
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
            <p className="bookingNote">Return date must be on or after the pick-up date.</p>
          )}
          {conflict && (
            <p className="bookingNote">Some of the days you picked are already booked.</p>
          )}

          <Button
            type="primary"
            block
            className="reserveBtn"
            disabled={invalidRange || conflict}
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