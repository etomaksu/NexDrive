import React from 'react'
import { Card, Tag, Button } from 'antd'
import Cars from '../data/Cars.js'

const unique = (key) => [...new Set(Cars.map((car) => car[key]))]

// buttonLabel: "View" (default) or "Book" -- onView receives the car id
const CarCards = ({ car, onView, buttonLabel = 'View' }) => {
  return (
    <Card
      className="carCard"
      hoverable
      cover={<img className="carImage" src={car.image} alt={car.name} />}
    >
      <div className="carCardHeader">
        <h4 className="carCardName">{car.name}</h4>
        <Tag color="blue" bordered={false}>{car.type}</Tag>
      </div>

      <p className="carCardSpecs">
        {car.transmission} · {car.seats} seats · {car.fuel}
      </p>

      <div className="carCardFooter">
        <span className="carCardPrice">₱{car.price.toLocaleString()} /day</span>
        <Button type="primary" onClick={() => onView && onView(car.id)}>
          {buttonLabel}
        </Button>
      </div>
    </Card>
  )
}

export default CarCards