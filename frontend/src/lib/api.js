import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

export const TOKEN_KEY = 'showtime_token'
export const USER_KEY = 'showtime_user'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let onUnauthorized = null
export function registerUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401 && onUnauthorized) {
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)

// Generic, human-readable fallbacks per HTTP status. The backend's own message (when it
// sends a plain, non-stack-trace string or a { message } / { error } body) always wins —
// these only fill in when the backend didn't send anything usable.
const STATUS_FALLBACKS = {
  400: 'That request was invalid. Please check the details and try again.',
  401: 'Your session has expired. Please log in again.',
  403: "You don't have permission to perform this action.",
  404: 'We could not find what you were looking for.',
  409: 'This resource is currently unavailable. It may have just been booked or changed by someone else.',
  422: 'Some of the details provided are invalid.',
  429: 'Too many attempts. Please wait a moment and try again.',
  500: 'Something went wrong on the server. Please try again.',
  502: 'The server is temporarily unavailable. Please try again shortly.',
  503: 'The service is temporarily unavailable. Please try again shortly.',
}

// A backend message is only usable if it's a short, plain sentence — not a Java stack
// trace, HTML error page, or other server-internal noise that should never reach the user.
function isUsableBackendMessage(text) {
  if (!text || typeof text !== 'string') return false
  const trimmed = text.trim()
  if (!trimmed || trimmed.length > 300) return false
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return false // looks like HTML
  if (/(Exception|\.java:|at [\w.$]+\(|Caused by:)/.test(trimmed)) return false // looks like a stack trace
  return true
}

export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (!err?.response) {
    // No response at all means the request never reached the server.
    return err?.message?.includes('Network') || err?.code === 'ERR_NETWORK'
      ? 'Could not reach the server. Please check your connection and try again.'
      : fallback
  }

  const status = err.response.status
  const data = err.response.data
  const backendMessage = data?.message || data?.error || (typeof data === 'string' ? data : null)

  if (isUsableBackendMessage(backendMessage)) return backendMessage
  return STATUS_FALLBACKS[status] || fallback
}

export default api
