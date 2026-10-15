import React from 'react'
import { Button, Card, Col, DatePicker, Input, Row, Select, Typography } from 'antd'
import dayjs from 'dayjs'
import Cars from '../data/Cars'
import CarCards from './CarCards'
import './HomePage.css'

const { Title, Paragraph, Text } = Typography

const BRAND = 'NexDrive'

const heroFeatures = [
  { title: 'Free cancellation', text: 'Up to 24 hours before' },
  { title: 'Insured trips', text: 'Basic cover included' },
  { title: 'Roadside help', text: 'Call any hour' },
]

const benefits = [
  { title: 'Well-kept fleet', text: 'Inspected and cleaned before every rental.' },
  { title: 'Clear pricing', text: 'Rates include basic cover. No surprise fees.' },
  { title: 'Easy changes', text: 'Reschedule or cancel from My Bookings.' },
  { title: 'Help on the road', text: 'Call us any hour. We are based in Imus.' },
]

const steps = [
  { title: 'Choose your car', text: 'Filter by type, price, seats and transmission.' },
  { title: 'Pick date and place', text: 'Set your schedule, pickup and return points.' },
  { title: 'Drive away', text: 'Upload your license, pay securely and go.' },
]

// ids from data/Cars.js: Xpander, Fortuner, Vios
const featuredIds = [6, 8, 1]
const heroCarId = 6

// One component, two versions:
//   isLoggedIn = false -> landing page: cards say "Book" and go to the Login page
//   isLoggedIn = true  -> member home:  cards say "View" and go to the Booking page
const HomePage = ({ isLoggedIn = false, setCurrentPage, setSelectedCarId }) => {
  const featuredCars = featuredIds.map((id) => Cars.find((c) => c.id === id)).filter(Boolean)
  const heroCar = Cars.find((c) => c.id === heroCarId)

  const handleCarAction = (id) => {
    if (isLoggedIn) {
      setSelectedCarId(id)
      setCurrentPage('booking')
    } else {
      setCurrentPage('login')
    }
  }

  return (
    <div className="homePage">
      {/* HERO */}
      <section className="hero">
        <div className="heroInner homeInner">
          <div className="heroCopy">
            <h1 className="heroTitle">
              Book a car in three minutes. Pick it up today.
            </h1>
            <Paragraph className="heroText">
              Self-drive rentals from Imus, Cavite. Choose your dates, add what you
              need and pay online.
            </Paragraph>

            <div className="heroFeatures">
              {heroFeatures.map((f) => (
                <div className="heroFeature" key={f.title}>
                  <strong>{f.title}</strong>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {heroCar && (
            <img className="heroCar" src={heroCar.image} alt={heroCar.name} />
          )}
        </div>
      </section>

      {/* FIND A CAR (overlaps the hero) */}
      <div className="homeInner">
        <Card className="findCard">
          <Title level={4} className="findTitle">Find a car</Title>
          <Row gutter={[16, 12]} align="bottom">
            <Col xs={24} lg={7}>
              <Text type="secondary">Pick-up location</Text>
              <Input size="large" defaultValue="Imus, Cavite" />
            </Col>
            <Col xs={12} lg={5}>
              <Text type="secondary">Pick-up date</Text>
              <DatePicker
                className="fullWidth"
                size="large"
                showTime={{ format: 'h:mm A' }}
                format="MMM D, h:mm A"
                defaultValue={dayjs('2026-10-10 09:00')}
              />
            </Col>
            <Col xs={12} lg={5}>
              <Text type="secondary">Return date</Text>
              <DatePicker
                className="fullWidth"
                size="large"
                showTime={{ format: 'h:mm A' }}
                format="MMM D, h:mm A"
                defaultValue={dayjs('2026-10-13 09:00')}
              />
            </Col>
            <Col xs={24} lg={4}>
              <Text type="secondary">Car type</Text>
              <Select
                className="fullWidth"
                size="large"
                defaultValue="all"
                options={[
                  { value: 'all', label: 'All types' },
                  { value: 'Sedan', label: 'Sedan' },
                  { value: 'SUV', label: 'SUV' },
                  { value: 'MPV', label: 'MPV' },
                ]}
              />
            </Col>
            <Col xs={24} lg={3}>
              <Button type="primary" size="large" block onClick={() => setCurrentPage('cars')}>
                Search cars
              </Button>
            </Col>
          </Row>
        </Card>
      </div>

      {/* WHY RENTERS PICK US */}
      <section className="homeSection homeInner whySection">
        <div className="whyIntro">
          <Title level={2} className="serif">Why renters pick {BRAND}</Title>
          <Paragraph type="secondary">
            We keep the fleet small enough to look after and the process short enough
            to finish on your phone.
          </Paragraph>
        </div>
        <div className="whyGrid">
          {benefits.map((b) => (
            <div className="whyItem" key={b.title}>
              <strong>{b.title}</strong>
              <span>{b.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED CARS */}
      <section className="homeSection homeInner">
        <Title level={2} className="serif">Featured cars</Title>
        <Paragraph type="secondary">Our most booked vehicles this month</Paragraph>
        <Row gutter={[24, 24]}>
          {featuredCars.map((car) => (
            <Col xs={24} md={12} lg={8} key={car.id}>
              <CarCards
                car={car}
                buttonLabel={isLoggedIn ? 'View' : 'Book'}
                onView={handleCarAction}
              />
            </Col>
          ))}
        </Row>
      </section>

      {/* HOW IT WORKS */}
      <section className="homeSection homeInner">
        <Title level={2} className="serif">How it works</Title>
        <Row gutter={[24, 24]}>
          {steps.map((s, i) => (
            <Col xs={24} md={8} key={s.title}>
              <Card className="stepCard">
                <span className="stepNumber">{i + 1}</span>
                <Title level={5}>{s.title}</Title>
                <Text type="secondary">{s.text}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* FOOTER */}
      <footer className="homeFooter">
        <div className="homeInner footerGrid">
          <div>
            <div className="footerLogo">{BRAND}</div>
            <p>Car rental made simple.<br />Imus, Cavite, Philippines</p>
          </div>
          <div>
            <h4>Company</h4>
            <a onClick={() => setCurrentPage('about')}>About us</a>
            <a onClick={() => setCurrentPage('contact')}>Contact</a>
            <a>FAQ</a>
          </div>
          <div>
            <h4>Support</h4>
            <span>help@webname.ph</span>
            <span>+63 900 000 0000</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage