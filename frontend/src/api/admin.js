import api from '../lib/api'

// POST /api/admin/registeradminuser (requires ADMIN role)
export const registerAdminUser = (payload) => api.post('/api/admin/registeradminuser', payload).then((r) => r.data)
