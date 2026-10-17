import React from 'react'
import { Card, Tag, Button } from 'antd'

const CarCards = ({ car, onView, buttonLabel = 'View' }) => {
  return (
    <Card
      className="carCard"
      hoverable
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { display: 'flex', flexDirection: 'column', flex: 1 } }}
      cover={
        <img
          className="carImage"
          src={car.image}
          alt={car.name}
          style={{
            height: 160,
            width: '100%',
            objectFit: 'contain',
            padding: '16px 16px 0',
          }}
        />}
    >
      <div className="carCardHeader">
        <h4 className="carCardName">{car.name}</h4>
        <Tag color="blue" bordered={false}>{car.type}</Tag>
      </div>

      <p className="carCardSpecs">
        {car.transmission} · {car.seats} seats · {car.fuel}
      </p>

      <div className="carCardFooter"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 'auto',
          paddingTop: 14,
          borderTop: '1px solid #eef0f3',
        }}>
        <span className="carCardPrice"
              style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#003b86',
                      whiteSpace: 'nowrap',
                    }}>₱{car.price.toLocaleString()} /day</span>
        <Button type="primary" onClick={() => onView && onView(car.id)}>
          {buttonLabel}
        </Button>
      </div>
    </Card>
  )
}

export default CarCards