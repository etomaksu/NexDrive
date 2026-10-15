import React, { useState } from 'react'
import vios from './images/toyotavios.png'
import fordRanger from './images/fordranger.png'
import hondaCity from './images/hondacity.png'
import xpander from './images/mitsubishixpander.png'
import hiace from './images/toyotahiace.png'
import fortuner from './images/toyotafortuner.png'
import bydHan from './images/bydhan.png'
import tesla from './images/tesla.png'
import accent from './images/hyundaiaccent.png'
import './CarListings.css'

const cars = [
  { id: 1, name: 'Toyota Vios', type: 'Sedan', transmission: 'Automatic', seats: 5, fuel: 'Gas', price: 1800, image: vios },
  { id: 2, name: 'Toyota Fortuner', type: 'SUV', transmission: 'Automatic', seats: 7, fuel: 'Diesel', price: 3500, image: fortuner },
  { id: 3, name: 'Mitsubishi Xpander', type: 'MPV', transmission: 'Manual', seats: 7, fuel: 'Gas', price: 2600, image: xpander },
  { id: 4, name: 'Toyota Hiace', type: 'Van', transmission: 'Manual', seats: 15, fuel: 'Diesel', price: 4500, image: hiace },
  { id: 5, name: 'Honda City', type: 'Sedan', transmission: 'Automatic', seats: 5, fuel: 'Gas', price: 2000, image: hondaCity },
  { id: 6, name: 'Ford Ranger', type: 'Pickup', transmission: 'Automatic', seats: 5, fuel: 'Diesel', price: 3800, image: fordRanger },
  { id: 7, name: 'BYD Han', type: 'EV', transmission: 'Automatic', seats: 6, fuel: 'Electric', price: 7500, image: bydHan },
  { id: 8, name: 'Tesla', type: 'EV', transmission: 'Automatic', seats: 5, fuel: 'Electric', price: 9800, image: tesla },
  { id: 9, name: 'Hyundai Accent', type: 'Sedan', transmission: 'Automatic', seats: 5, fuel: 'Diesel', price: 2300, image: accent },
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

const CarListings = ({setCurrentPage}) => {
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
    <div className="carsPage">
      <header className="navbar">
        <div className="navLeft">
          <span className="brandLogo" onClick={() => setCurrentPage('home')}>
            NexDrive
          </span>
          <nav className="navLinks">
            <button className="navLinkBtn" onClick={() => setCurrentPage('home')}>Home</button>
            <button className="navLinkBtn active" onClick={() => setCurrentPage('cars')}>Cars</button>
            <button className="navLinkBtn" onClick={() => setCurrentPage('contact')}>Contact</button>
          </nav>
        </div>

        <div className="navCenter">
          <div className="searchBar">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search cars, bookings" />
          </div>
        </div>

        <div className="navRight">
          <button className="btnLogin" onClick={() => setCurrentPage('login')}>
            Login
          </button>
          <button className="btnRegister" onClick={() => setCurrentPage('register')}>
            Register
          </button>
        </div>
      </header>
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
                <img className="car-image" src={car.image} alt={car.name} />
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
    
    </div>
    
  )
}

export default CarListings;