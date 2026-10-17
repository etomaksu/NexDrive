import React, { useState, useEffect } from 'react'
import CarCards from '../CarCards'
import './CarListings.css'
import { useNavigate } from 'react-router-dom';
import {fetchCars} from '../../api/cars'


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
  const navigate = useNavigate()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCars()
    .then(setCars)
    .catch((err) => console.log(err))
    .finally(() => setLoading(false))
  }, [])

  const unique = (key) => [...new Set(cars.map((car) => car[key]))]

  const filterOptions = {
    type: unique('type'),
    transmission: unique('transmission'),
    seats: ['2-5', '6-8', '9+'],
    fuel: unique('fuel'),
  }

  const maxCarPrice = cars.length
    ? Math.ceil(Math.max(...cars.map((car) => car.price)) / 1000) * 1000
    : 10000

  const [filters, setFilters] = useState({
    type: [],
    transmission: [],
    seats: [],
    fuel: [],
  })
  const [maxPrice, setMaxPrice] = useState(null)
  const priceLimit = maxPrice ?? maxCarPrice
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

  const visibleCars = Cars
    .filter(
      (car) =>
        matches(filters.type, car.type) &&
        matches(filters.transmission, car.transmission) &&
        matches(filters.seats, seatRange(car.seats)) &&
        matches(filters.fuel, car.fuel) &&
        car.price <= priceLimit
    )
    .sort((a, b) => (sort === 'low' ? a.price - b.price : b.price - a.price))

    if (loading) return <p style={{ padding: 24 }}>Loading cars...</p>
  return (
    <div className="carsPage">
      <section id="fleet">
        <button className="backBtn" onClick={() => navigate('/')}>
          ← Back to home
        </button>
        <h1 id="fleet-title">Browse our fleet</h1>
        <p id="fleet-subtitle">Filter by type, seats, or budget to find your match.</p>

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
                <span id="price-value">₱{priceLimit.toLocaleString()}</span>
              </div>
              <input
                id="price-range"
                type="range"
                min="1000"
                max={maxCarPrice}
                step="100"
                value={priceLimit}
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
                <CarCards
                  key={car.id}
                  car={car}
                  onView={(id) => navigate(`/cars/${id}`)}
                />
              ))}
            </div>
          </main>
        </div>
      </section>
    </div>
  )
}
//changes
export default CarListings