import api from '../lib/api'

// POST /api/seats/create?showId= (ADMIN) - generates the seat layout for a show
export const createSeatsForShow = (showId) =>
  api.post('/api/seats/create', null, { params: { showId } }).then((r) => r.data)

// GET /api/seats/show/{showId} (requires authentication)
export const getSeatsForShow = (showId) => api.get(`/api/seats/show/${showId}`).then((r) => r.data)
