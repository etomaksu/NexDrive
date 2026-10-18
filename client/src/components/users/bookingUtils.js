import carImages from '../../data/carImages'

const API = 'http://localhost:8000/api'
const FILE_BASE = API.replace(/\/api$/, '')

// Picture for a car: an uploaded photo first, then the old built-in picture
export const carImageSrc = (car) =>
  !car ? undefined : car.imageUrl ? `${FILE_BASE}${car.imageUrl}` : carImages[car.imageKey]

// What the customer sees for each reservation status
export const STATUS_LABEL = {
  requested: 'Pending',
  approved: 'Confirmed',
  active: 'Active',
  returned: 'Completed',
  completed: 'Completed',
  rejected: 'Declined',
  cancelled: 'Cancelled',
}

// CSS class for the badge (re-uses the existing pending / confirmed / completed / cancelled styles)
export const STATUS_CLASS = {
  requested: 'pending',
  approved: 'confirmed',
  active: 'confirmed',
  returned: 'completed',
  completed: 'completed',
  rejected: 'cancelled',
  cancelled: 'cancelled',
}

export const isUpcoming = (b) => ['requested', 'approved', 'active'].includes(b.status)
export const isCompleted = (b) => ['returned', 'completed'].includes(b.status)
export const isCancelled = (b) => ['cancelled', 'rejected'].includes(b.status)
export const canCancel = (b) => ['requested', 'approved'].includes(b.status)

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })

export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })

export const formatRange = (from, to) => {
  const s = new Date(from)
  const e = new Date(to)
  const month = (d) => d.toLocaleDateString('en-PH', { month: 'short' })
  return s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()
    ? `${month(s)} ${s.getDate()} – ${e.getDate()}`
    : `${month(s)} ${s.getDate()} – ${month(e)} ${e.getDate()}`
}

export const timeAgo = (iso) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  return days === 1 ? 'Yesterday' : `${days} days ago`
}

// whole calendar days from today to a date (0 = today, 1 = tomorrow)
export const daysUntil = (iso) => {
  const a = new Date(); a.setHours(0, 0, 0, 0)
  const b = new Date(iso); b.setHours(0, 0, 0, 0)
  return Math.round((b - a) / 86400000)
}

// Turns a booking from the API into what ReceiptPopUp shows
export const toReceipt = (b) => ({
  code: b.ref,
  paymentStatus: b.paidAmount > 0 ? 'Paid' : 'Unpaid',
  carName: b.car ? b.car.name : 'Car',
  pickupAt: b.pickupAt,
  returnAt: b.returnAt,
  pickupLocation: b.pickupLocation,
  returnLocation: b.returnLocation,
  days: b.days,
  price: b.price,
  rentalTotal: b.rentalTotal,
  addonsTotal: b.addonsTotal,
  serviceFee: b.serviceFee,
  total: b.total,
  paidLabel: b.paidType === 'full' ? 'Full payment paid' : 'Downpayment paid (50%)',
  paidAmount: b.paidAmount,
  balance: Math.max(0, b.total - b.paidAmount),
  method: b.method,
  txnId: b.txnId,
  paidAt: b.paidAt,
})