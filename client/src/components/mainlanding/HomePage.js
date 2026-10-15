import React from 'react';
import innova from './images/toyotainnova.png'
import fortuner from './images/toyotafortuner.png'
import vios from './images/toyotavios.png'
import './HomePage.css';

function HomePage({ setCurrentPage }) {
  const cars = [
    {
      id: 1,
      name: 'Toyota Innova 2025',
      type: 'MPV',
      details: 'Automatic · 7 seats · Gas',
      price: '₱1,800 /day',
      image: innova, 
    },
    {
      id: 2,
      name: 'Toyota Fortuner',
      type: 'SUV',
      details: 'Automatic · 7 seats · Diesel',
      price: '₱3,500 /day',
      image: fortuner, 
    },
    {
      id: 3,
      name: 'Toyota Vios',
      type: 'Sedan',
      details: 'Manual · 5 seats · Gas',
      price: '₱2,600 /day',
      image: vios, 
    },
  ];

  return (
    <div className="pageWrap">
      <header className="navbar">
        <div className="navLeft">
          <span className="brandLogo" onClick={() => setCurrentPage('home')}>
            NexDrive
          </span>
          <nav className="navLinks">
            <button className="navLinkBtn active" onClick={() => setCurrentPage('home')}>Home</button>
            <button className="navLinkBtn" onClick={() => setCurrentPage('cars')}>Cars</button>
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

      <section className="headSection">
        <div className="headContent">
          <h1>Book a car in<br />three minutes.<br />Pick it up today.</h1>
          <p className="headContent .heroSubtext">
            Self-drive rentals from Imus, Cavite. Choose your dates,
            add what you need and pay online. <br /><br />
          </p>

          <div className="heroFeatures">
            <div className="featureItem">
              <strong>Free cancellation</strong>
              <span>Up to 24 hours before</span>
            </div>
            <div className="featureItem">
              <strong>Insured trips</strong>
              <span>Basic cover included</span>
            </div>
            <div className="featureItem">
              <strong>Roadside help</strong>
              <span>Call any hour</span>
            </div>
          </div>
        </div>

        <div className="headImgContainer">
          <img
            src="/car-xpander.png"
            alt="Mitsubishi Xpander"
            className="headCarImg"
          />
        </div>
      </section>

      <div className="searchCardWrap">
        <div className="searchCard">
          <h2>Find a car</h2>
          <div className="searchForm">
            <div className="inputGroup">
              <label>Pick-up location</label>
              <input type="text" defaultValue="Imus, Cavite" />
            </div>
            <div className="inputGroup">
              <label>Pick-up date</label>
              <input type="text" defaultValue="Today Oct 12, 9:00 AM" />
            </div>
            <div className="inputGroup">
              <label>Return date</label>
              <input type="text" defaultValue="Oct 13, 9:00 AM" />
            </div>
            <div className="inputGroup">
              <label>Car type</label>
              <select defaultValue="All types">
                <option value="All types">All types</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="MPV">MPV</option>
              </select>
            </div>
            <button className="btnSearch">Search cars</button>
          </div>
        </div>
      </div>

      <section className="benefitsSection">
        <div className="benefitsTitle">
          <h2>Why renters pick<br />NexDrive</h2>
          <p>We keep the fleet small enough to look after and the process short enough to finish on your phone.</p>
        </div>
        <div className="benefitsGrid">
          <div className="benefitCard">
            <h3>Well-kept fleet</h3>
            <p>Inspected and cleaned before every rental.</p>
          </div>
          <div className="benefitCard">
            <h3>Clear pricing</h3>
            <p>Rates include basic cover. No surprise fees.</p>
          </div>
          <div className="benefitCard">
            <h3>Easy changes</h3>
            <p>Reschedule or cancel from My Bookings.</p>
          </div>
          <div className="benefitCard">
            <h3>Help on the road</h3>
            <p>Call us any hour. We are based in Imus.</p>
          </div>
        </div>
      </section>

      <section className="featuredSection">
        <div className="sectionHeader">
          <h2>Featured cars</h2>
          <p>Our most booked vehicles this month</p>
        </div>

        <div className="carsGrid">
          {cars.map((car) => (
            <div key={car.id} className="carCard">
              <div className="carImgContainer">
              {car.image && <img className="carCardImg" src={car.image} alt={car.name} />}              </div>
              <div className="carCardHeader">
                <h3>{car.name}</h3>
                <span className={`badge badge-${car.type.toLowerCase()}`}>{car.type}</span>
              </div>
              <p className="carDetails">{car.details}</p>
              <div className="carCardFooter">
                <span className="carPrice">{car.price}</span>
                <button className="btnBook">Book</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="howSection">
        <div className="sectionHeader">
          <h2>How it works</h2>
        </div>

        <div className="stepsGrid">
          <div className="stepCard">
            <span className="stepNumber">1</span>
            <h3>Choose your car</h3>
            <p>Filter by type, price, seats and transmission.</p>
          </div>
          <div className="stepCard">
            <span className="stepNumber">2</span>
            <h3>Pick date and place</h3>
            <p>Set your schedule, pickup and return points.</p>
          </div>
          <div className="stepCard">
            <span className="stepNumber">3</span>
            <h3>Drive away</h3>
            <p>Upload your license, pay securely and go.</p>
          </div>
        </div>
      </section>

      <section className="ctaBanner">
        <div className="ctaContent">
          <h2>Ready to hit the road?<br />Book your car in under 3 minutes.</h2>
          <button className="btnCta">Book now</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="pageContainer footerGrid">
          <div>
            <h3 className="footerLogo">NexDrive</h3>
            <ul>
              <li>Car rental made simple. <br /> Imus, Cavite, Philippines</li>
          </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li onClick={() => setCurrentPage('about')}>About us</li>
              <li>Contact</li>
              <li>FAQ</li>
            </ul>
          </div>
          <div>
            <div>
          <h4>Support</h4>
          <ul>
              <li>help@nexdrive.ph</li>
              <li>+63 910 117 6684</li>
          </ul>
          </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;