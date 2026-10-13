import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const daysInMonth = 31

const CarDetails = () => {
  const { id } = useParams() // from a route like /cars/:id

  const [car, setCar] = useState(null)
  const [bookedDays, setBookedDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [pickup, setPickup] = useState('')
  const [returnDate, setReturnDate] = useState('')

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await fetch(`/api/cars/${id}`)
        if (!res.ok) throw new Error('Car not found')
        const data = await res.json()
        setCar(data)
        setBookedDays(data.bookedDays || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCar()
  }, [id])

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>
  if (!car) return null

  const specs = [
    { label: 'Type', value: car.type },
    { label: 'Transmission', value: car.transmission },
    { label: 'Seats', value: car.seats },
    { label: 'Fuel', value: car.fuel },
    { label: 'Luggage', value: car.luggage },
    { label: 'Year', value: car.year },
    { label: 'Doors', value: car.doors },
    { label: 'Mileage', value: car.mileage },
  ]

  const handleReserve = () => {
    if (!pickup || !returnDate) {
      alert('Please choose pick-up and return dates')
      return
    }
    if (returnDate < pickup) {
      alert('Return date must be after the pick-up date')
      return
    }
    // send the booking to your backend here
    console.log('Reserving', car.name, pickup, returnDate)
  }

  return (
    <section id="car-details">
      <p id="breadcrumb">
        Cars / {car.type} / {car.name}
      </p>

      <div id="car-title-row">
        <h1 id="car-title">{car.name}</h1>
        {car.available && <span id="car-status">Available</span>}
      </div>

      <div id="car-layout">
        <div id="car-left">
          <img id="car-image" src={car.image} alt={car.name} />

          <div id="specs-card">
            <h2 id="specs-title">Specifications</h2>

            <div id="specs-grid">
              {specs.map((spec) => (
                <div className="spec" key={spec.label}>
                  <span className="spec-label">{spec.label}</span>
                  <span className="spec-value">{spec.value}</span>
                </div>
              ))}
            </div>

            <p id="car-description">{car.description}</p>
          </div>
        </div>

        <aside id="booking-card">
          <p id="booking-price">
            ₱{car.price.toLocaleString()} <span>/ day</span>
          </p>

          <div id="date-row">
            <div className="date-field">
              <label id="">Pick-up</label>
              <input
                id="pickup"
                type="date"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
            </div>

            <div className="date-field">
              <label id="">Return</label>
              <input
                id="return"
                type="date"
                min={pickup}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
          </div>

          <h3 id="availability-title">Availability · October 2026</h3>

          <div id="calendar">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
              <span
                key={day}
                className={bookedDays.includes(day) ? 'day booked' : 'day available'}
              >
                {day}
              </span>
            ))}
          </div>

          <div id="legend">
            <span className="legend-item available">Available</span>
            <span className="legend-item booked">Booked</span>
          </div>

          <button id="reserve-btn" onClick={handleReserve}>
            Reserve now
          </button>
        </aside>
      </div>
    </section>
  )
}

export default CarDetails