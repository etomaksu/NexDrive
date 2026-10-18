import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { message } from 'antd'
import { fetchCar } from '../../api/cars'
import { fetchBookingOptions, saveDraft } from '../../api/bookings'
import './BookingsPage.css'

const DAY = 24 * 60 * 60 * 1000
const dayCount = (a, b) => Math.max(1, Math.round((new Date(b.slice(0, 10)) - new Date(a.slice(0, 10))) / DAY))

const BookingsPage = () => {
  const { carId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addons, setAddons] = useState([])
  const [serviceFee, setServiceFee] = useState(0)

  const [pickupLocation, setPickupLocation] = useState('Pasay City, Metro Manila (Main Branch)')
  const [returnLocation, setReturnLocation] = useState('')
  const [pickupDate, setPickupDate] = useState(`${params.get('pickup') || ''}T09:00`)
  const [returnDate, setReturnDate] = useState(`${params.get('return') || ''}T09:00`)
  const [selectedAddons, setSelectedAddons] = useState([])

  useEffect(() => {
    fetchCar(carId).then(setCar).catch(() => setCar(null)).finally(() => setLoading(false))
    fetchBookingOptions()
      .then((o) => { setAddons(o.addons); setServiceFee(o.serviceFee) })
      .catch(() => message.error('Could not load the add-ons.'))
  }, [carId])

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>
  if (!car) {
    return (
      <section id="booking">
        <button className="backBtn" onClick={() => navigate('/cars')}>← Back to cars</button>
        <p>We couldn't find that car.</p>
      </section>
    )
  }

  const hasDates = pickupDate.length === 16 && returnDate.length === 16
  const invalidRange = !hasDates || returnDate < pickupDate
  const days = hasDates && !invalidRange ? dayCount(pickupDate, returnDate) : 1

  const toggleAddon = (id) =>
    setSelectedAddons((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))

  const chosenAddons = addons.filter((a) => selectedAddons.includes(a.id))
  const carTotal = car.price * days
  const total = carTotal + chosenAddons.reduce((sum, a) => sum + a.pricePerDay * days, 0) + serviceFee

  // Nothing is saved here. The booking is created when the customer pays.
  const handleContinue = () => {
    if (invalidRange) return message.error('Return must be after the pick-up.')
    if (!pickupLocation.trim()) return message.error('Enter a pick-up location.')

    const draft = {
      carId,
      pickup: pickupDate,
      returnDate,
      pickupLocation: pickupLocation.trim(),
      returnLocation: returnLocation.trim() || pickupLocation.trim(),
      addons: selectedAddons,
    }
    saveDraft(draft)
    navigate('/payment', { state: { draft } })
  }

  return (
    <div>
      <section id="booking">
        <button className="backBtn" onClick={() => navigate(-1)}>
          ← Car details
        </button>
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
                  <label>Pickup location</label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="Pasay City, Metro Manila (Main Branch)"
                  />
                </div>

                <div className="field">
                  <label>Return location</label>
                  <input
                    id="return-location"
                    type="text"
                    value={returnLocation}
                    onChange={(e) => setReturnLocation(e.target.value)}
                    placeholder="Ex. Manila Airport T3"
                  />
                </div>

                <div className="field">
                  <label>Pick-up date & time</label>
                  <input
                    id="pickup-date"
                    type="datetime-local"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Return date & time</label>
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
                  <label key={addon.id} className={selected ? 'addon selected' : 'addon'}>
                    <input type="checkbox" checked={selected} onChange={() => toggleAddon(addon.id)} />
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
                <span>₱{serviceFee.toLocaleString()}</span>
              </div>
            </div>

            <div id="summary-total">
              <span>Total</span>
              <strong>₱{total.toLocaleString()}</strong>
            </div>

            <button id="continue-btn" onClick={handleContinue} disabled={invalidRange}>
              Continue to payment
            </button>
          </aside>
        </div>
      </section>
    </div>
  )
}

export default BookingsPage