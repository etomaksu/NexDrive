import React from 'react'

const CarDetails = () => {
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
            <label id="pickup-label" htmlFor="pickup">Pick-up</label>
            <input
              id="pickup"
              type="date"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
            />
          </div>

          <div className="date-field">
            <label id="return-label" htmlFor="return">Return</label>
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
