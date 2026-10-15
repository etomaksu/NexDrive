import React from 'react'
import Cars from '../../data/Cars'

const BookingsPage = () => {
  const car = Cars
  return (
    <div>
          <section id="booking">
      <h1 id="booking-title">Book your car</h1>
      <p id="booking-subtitle">{car.name} · Step 2 of 3</p>

      <div id="booking-layout">
        {/* LEFT COLUMN */}
        <div id="booking-left">
          {/* Trip details */}
          <div className="card" id="trip-card">
            <h2 className="card-title">Trip details</h2>

            <div id="trip-grid">
              <div className="field">
                <label id="">Pickup location</label>
                <input
                  id=""
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Pasay City, Metro Manila (Main Branch)"
                />
              </div>

              <div className="field">
                <label id="">Return location</label>
                <input
                  id="return-location"
                  type="text"
                  value={returnLocation}
                  onChange={(e) => setReturnLocation(e.target.value)}
                  placeholder="Ex. Manila Airport T3"
                />
              </div>

              <div className="field">
                <label id="">Pick-up date & time</label>
                <input
                  id="pickup-date"
                  type="datetime-local"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                />
              </div>

              <div className="field">
                <label id="">Return date & time</label>
                <input
                  id="return-date"
                  type="datetime-local"
                  min={pickupDate}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Add-ons */}
          <div className="card" id="addons-card">
            <h2 className="card-title">Add-ons</h2>

            {addons.map((addon) => {
              const selected = selectedAddons.includes(addon.id)
              return (
                <label
                  key={addon.id}
                  className={selected ? 'addon selected' : 'addon'}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleAddon(addon.id)}
                  />
                  <div className="addon-info">
                    <span className="addon-name">{addon.name}</span>
                    <span className="addon-desc">{addon.description}</span>
                  </div>
                  <span className="addon-price">₱{addon.pricePerDay} / day</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: summary */}
        <aside className="card" id="summary-card">
          <img id="summary-image" src={car.image} alt={car.name} />
          <h3 id="summary-name">{car.name}</h3>

          <div id="summary-lines">
            <div className="summary-line">
              <span>
                ₱{car.price.toLocaleString()} × {days} {days === 1 ? 'day' : 'days'}
              </span>
              <span>₱{carTotal.toLocaleString()}</span>
            </div>

            {chosenAddons.map((addon) => (
              <div className="summary-line" key={addon.id}>
                <span>{addon.name}</span>
                <span>₱{(addon.pricePerDay * days).toLocaleString()}</span>
              </div>
            ))}

            <div className="summary-line">
              <span>Service fee</span>
              <span>₱{SERVICE_FEE.toLocaleString()}</span>
            </div>
          </div>

          <div id="summary-total">
            <span>Total</span>
            <strong>₱{total.toLocaleString()}</strong>
          </div>

          <button id="continue-btn" onClick={handleContinue}>
            Continue to payment
          </button>
        </aside>
      </div>
    </section>
    </div>
  )
}

export default BookingsPage
