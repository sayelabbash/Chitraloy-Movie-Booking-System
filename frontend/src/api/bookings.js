import api from '../lib/api'

// POST /api/booking/createbooking { seatNumbers: [], showId }
export const createBooking = (bookingDTO) => api.post('/api/booking/createbooking', bookingDTO).then((r) => r.data)

// GET /api/booking/mybookings
export const getMyBookings = () => api.get('/api/booking/mybookings').then((r) => r.data)

// GET /api/booking/getuserbookings/{id} (ADMIN)
export const getUserBookings = (userId) => api.get(`/api/booking/getuserbookings/${userId}`).then((r) => r.data)

// GET /api/booking/getshowbookings/{id} (ADMIN)
export const getShowBookings = (showId) => api.get(`/api/booking/getshowbookings/${showId}`).then((r) => r.data)

// PUT /api/booking/{id}/cancel
export const cancelBooking = (id) => api.put(`/api/booking/${id}/cancel`).then((r) => r.data)

// GET /api/booking/getbookingbystatus/{status} (ADMIN) - status: CONFIRMED | CANCELLED | PENDING
export const getBookingsByStatus = (status) => api.get(`/api/booking/getbookingbystatus/${status}`).then((r) => r.data)
