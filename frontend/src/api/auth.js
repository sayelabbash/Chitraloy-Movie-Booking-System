import api from '../lib/api'

// POST /api/auth/registernormaluser
export const registerUser = (payload) => api.post('/api/auth/registernormaluser', payload).then((r) => r.data)

// POST /api/auth/login -> { jwtToken, username, roles }
export const login = (payload) => api.post('/api/auth/login', payload).then((r) => r.data)

// GET /api/auth/me -> User entity
export const getCurrentUser = () => api.get('/api/auth/me').then((r) => r.data)
