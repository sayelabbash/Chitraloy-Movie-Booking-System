import api from '../lib/api'

// GET /api/theater/getall (public)
export const getAllTheaters = () => api.get('/api/theater/getall').then((r) => r.data)

// GET /api/theater/getTheaterByLocation?location (public)
export const getTheatersByLocation = (location) =>
  api.get('/api/theater/getTheaterByLocation', { params: { location } }).then((r) => r.data)

// POST /api/theater/addTheater (ADMIN)
export const addTheater = (theaterDTO) => api.post('/api/theater/addTheater', theaterDTO).then((r) => r.data)

// PUT /api/theater/updateTheater/{id} (ADMIN)
export const updateTheater = (id, theaterDTO) =>
  api.put(`/api/theater/updateTheater/${id}`, theaterDTO).then((r) => r.data)

// DELETE /api/theater/deleteTheater/{id} (ADMIN)
export const deleteTheater = (id) => api.delete(`/api/theater/deleteTheater/${id}`).then((r) => r.data)
