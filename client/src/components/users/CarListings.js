import React, { useState } from 'react'
import './CarListings.css'

const cars = [
  { id: 1, name: 'Toyota Vios', type: 'Sedan', transmission: 'Automatic', seats: 5, fuel: 'Gas', price: 1800, image: '/images/toyota-vios.png' },
  { id: 2, name: 'Toyota Fortuner', type: 'SUV', transmission: 'Automatic', seats: 7, fuel: 'Diesel', price: 3500, image: '/images/toyota-fortuner.png' },
  { id: 3, name: 'Mitsubishi Xpander', type: 'MPV', transmission: 'Manual', seats: 7, fuel: 'Gas', price: 2600, image: '/images/mitsubishi-xpander.png' },
  { id: 4, name: 'Toyota Hiace', type: 'Van', transmission: 'Manual', seats: 15, fuel: 'Diesel', price: 4500, image: '/images/toyota-hiace.png' },
  { id: 5, name: 'Honda City', type: 'Sedan', transmission: 'Automatic', seats: 5, fuel: 'Gas', price: 2000, image: '/images/honda-city.png' },
  { id: 6, name: 'Ford Ranger', type: 'Pickup', transmission: 'Automatic', seats: 5, fuel: 'Diesel', price: 3800, image: '/images/ford-ranger.png' },
  { id: 7, name: 'BYD Han', type: 'EV', transmission: 'Automatic', seats: 6, fuel: 'Electric', price: 7500, image: '/images/byd-han.png' },
  { id: 8, name: 'Tesla', type: 'EV', transmission: 'Automatic', seats: 5, fuel: 'Electric', price: 9800, image: '/images/tesla.png' },
  { id: 9, name: 'Hyundai Accent', type: 'Sedan', transmission: 'Automatic', seats: 5, fuel: 'Diesel', price: 2300, image: '/images/hyundai-accent.png' },
]

const filterOptions = {
  type: ['Sedan', 'SUV', 'MPV', 'Van', 'Pickup', 'EV'],
  transmission: ['Automatic', 'Manual', 'Electric'],
  seats: ['2-5', '6-8', '9+'],
  fuel: ['Gas', 'Diesel', 'Hybrid'],
}

const filterTitles = {
  type: 'Vehicle type',
  transmission: 'Transmission',
  seats: 'Seats',
  fuel: 'Fuel',
}

const seatRange = (seats) => {
  if (seats <= 5) return '2-5'
  if (seats <= 8) return '6-8'
  return '9+'
}

const CarListings = () => {
  const [filters, setFilters] = useState({
    type: [],
    transmission: [],
    seats: [],
    fuel: [],
  })
  const [maxPrice, setMaxPrice] = useState(10000)
  const [sort, setSort] = useState('low')

  // tick / untick a checkbox
  const toggleFilter = (group, value) => {
    setFilters((prev) => ({
      ...prev,
      [group]: prev[group].includes(value)
        ? prev[group].filter((v) => v !== value)
        : [...prev[group], value],
    }))
  }

  // an empty group means "no filter" for that group
  const matches = (selected, value) =>
    selected.length === 0 || selected.includes(value)

  const visibleCars = cars
    .filter(
      (car) =>
        matches(filters.type, car.type) &&
        matches(filters.transmission, car.transmission) &&
        matches(filters.seats, seatRange(car.seats)) &&
        matches(filters.fuel, car.fuel) &&
        car.price <= maxPrice
    )
    .sort((a, b) => (sort === 'low' ? a.price - b.price : b.price - a.price))

  return (
    <section id="fleet">
      <h1 id="fleet-title">Browse our fleet</h1>
      <p id="fleet-subtitle">Vehicles Available · Oct 10 – 13</p>

      <div id="fleet-layout">
        {/* FILTERS */}
        <aside id="filters">
          <h3 id="filters-title">Filters</h3>

          {Object.keys(filterOptions).map((group) => (
            <fieldset key={group}>
              <legend>{filterTitles[group]}</legend>
              {filterOptions[group].map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    checked={filters[group].includes(option)}
                    onChange={() => toggleFilter(group, option)}
                  />
                  {option}
                </label>
              ))}
            </fieldset>
          ))}

          <div id="filter-price">
            <div id="price-label">
              <span>Max price / day</span>
              <span id="price-value">₱{maxPrice.toLocaleString()}</span>
            </div>
            <input
              id="price-range"
              type="range"
              min="1000"
              max="10000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </div>
        </aside>

        {/* RESULTS */}
        <main id="fleet-results">
          <div id="results-bar">
            <span id="result-count">{visibleCars.length} results</span>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="low">Sort: Price low to high</option>
              <option value="high">Sort: Price high to low</option>
            </select>
          </div>

          <div id="car-grid">
            {visibleCars.map((car) => (
              <article className="car-card" key={car.id}>
                <img src={car.image} alt={car.name} />
                <div className="car-header">
                  <h4>{car.name}</h4>
                  <span className="badge">{car.type}</span>
                </div>
                <p className="car-specs">
                  {car.transmission} · {car.seats} seats · {car.fuel}
                </p>
                <div className="car-footer">
                  <span className="car-price">₱{car.price} /day</span>
                  <button className="book-btn">Book</button>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </section>
  )
}

export default CarListings