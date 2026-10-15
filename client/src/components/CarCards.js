import React from "react";
import { Card, Tag, Button } from "antd";
import Cars from "../data/Cars";

const CarCards = ({car, onView}) => {
    return (
        <Card  
            className="carCard"
            hoverable
            cover={<img className="carImage" src={Cars.image} alt={Cars.name}/>}
        >
            <div className="carCardHeader">
                <h4 className="carCardName">{Cars.name}</h4>
                <Tag color="blue" bordered={false}>{Cars.type}</Tag>
            </div>
 
                <p className="carCardSpecs">
                    {Cars.transmission} · {Cars.seats} seats · {Cars.fuel}
                </p>
 
            <div className="carCardFooter">
                <span className="carCardPrice">₱{Cars.price} /day</span>
                <Button type="primary" onClick={() => onView && onView(Cars.id)}> View </Button>
            </div>
        
        </Card>
    )
}

export default CarCards

////changes