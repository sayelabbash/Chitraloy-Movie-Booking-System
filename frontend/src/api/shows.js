import api from '../lib/api'

// GET /api/show/getallshows (public)
export const getAllShows = () => api.get('/api/show/getallshows').then((r) => r.data)

// GET /api/show/{id} (public)
export const getShowById = (id) => api.get(`/api/show/${id}`).then((r) => r.data)

// GET /api/show/getshowsbymovie/{id} (public)
export const getShowsByMovie = (movieId) => api.get(`/api/show/getshowsbymovie/${movieId}`).then((r) => r.data)

// GET /api/show/getshowsbytheater/{id} (public)
export const getShowsByTheater = (theaterId) => api.get(`/api/show/getshowsbytheater/${theaterId}`).then((r) => r.data)

// POST /api/show/createshow (ADMIN)
export const createShow = (showDTO) => api.post('/api/show/createshow', showDTO).then((r) => r.data)

// PUT /api/show/updateshow/{id} (ADMIN)
export const updateShow = (id, showDTO) => api.put(`/api/show/updateshow/${id}`, showDTO).then((r) => r.data)

// DELETE /api/show/deleteshow/{id} (ADMIN)
export const deleteShow = (id) => api.delete(`/api/show/deleteshow/${id}`).then((r) => r.data)
