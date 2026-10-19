import axios from 'axios'
import carImages from '../data/carImages'

const API = 'http://127.0.0.1:8000/api'
const FILE_BASE = API.replace(/\/api$/, '')   // "http://127.0.0.1:8000"
const addImage = (car) => ({
  ...car,
  image: car.imageUrl ? `${FILE_BASE}${car.imageUrl}` : carImages[car.imageKey],
})

export const fetchCars = () => 
    axios.get(`${API}/cars`).then ((res)=> res.data.map(addImage))

export const fetchCar = (id) =>
    axios.get(`${API}/cars/${id}`).then((res)=> addImage(res.data))