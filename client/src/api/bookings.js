import axios from 'axios'

const API = 'http://localhost:8000/api'

const authed = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

// Days already taken for a car: [{ from: '2026-10-14', to: '2026-10-19' }, ...]
export const fetchAvailability = (carId) =>
  axios.get(`${API}/reservations/availability/${carId}`, authed()).then((r) => r.data.ranges)

// { addons: [{ id, name, description, pricePerDay }], serviceFee }
export const fetchBookingOptions = () =>
  axios.get(`${API}/reservations/options`, authed()).then((r) => r.data)

// draft: { carId, pickup, returnDate, pickupLocation, returnLocation, addons: ['gps'] }
// -> { carName, days, rentalTotal, addonsTotal, serviceFee, total, downpayment, balance }   (nothing is saved)
export const fetchQuote = (draft) =>
  axios.post(`${API}/reservations/quote`, draft, authed()).then((r) => r.data)

// Creates the booking and records the payment.   option: 'down' | 'full'   method: 'card' | 'gcash' | 'maya' | 'bank'
export const checkout = (draft, { option, method }) =>
  axios.post(`${API}/reservations/checkout`, { ...draft, option, method }, authed()).then((r) => r.data)

export const fetchMyBookings = () =>
  axios.get(`${API}/reservations/mine`, authed()).then((r) => r.data)

// The booking is kept here between the booking page and the payment page (survives a refresh)
const DRAFT_KEY = 'nexdrive_booking_draft'
export const saveDraft = (draft) => { try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)) } catch (e) {} }
export const loadDraft = () => { try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null') } catch (e) { return null } }
export const clearDraft = () => { try { sessionStorage.removeItem(DRAFT_KEY) } catch (e) {} }