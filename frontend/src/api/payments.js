import api from '../lib/api'

// POST /api/payment/create/{bookingId} -> { orderId, amount } (amount in paise)
export const createPaymentOrder = (bookingId) => api.post(`/api/payment/create/${bookingId}`).then((r) => r.data)

// POST /api/payment/verify/{bookingId} { razorpay_order_id, razorpay_payment_id, razorpay_signature }
export const verifyPayment = (bookingId, payload) =>
  api.post(`/api/payment/verify/${bookingId}`, payload).then((r) => r.data)
