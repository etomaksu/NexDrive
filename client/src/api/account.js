import axios from 'axios'

const API = 'http://localhost:8000/api'
const authed = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

// { firstName, lastName, email, phone, address, license: { status: 'none'|'pending'|'verified'|'rejected', front, back } }
export const fetchProfile = () => axios.get(`${API}/profile`, authed()).then((r) => r.data)

export const saveProfile = (form) => axios.put(`${API}/profile`, form, authed()).then((r) => r.data)

// files: [front, back]  (one or two images)
export const uploadLicense = ([front, back]) => {
  const data = new FormData()
  if (front) data.append('front', front)
  if (back) data.append('back', back)
  return axios.post(`${API}/profile/license`, data, authed()).then((r) => r.data)
}

export const cancelBooking = (id) => axios.patch(`${API}/reservations/${id}/cancel`, {}, authed()).then((r) => r.data)