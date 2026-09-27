import api from '../lib/api'

// GET /api/movies/getallmovies?page&size (public, size max 20)
export const getAllMovies = (page = 0, size = 12) =>
  api.get('/api/movies/getallmovies', { params: { page, size } }).then((r) => r.data)

// GET /api/movies/getmoviebygenre?genre&page&size (public)
export const getMoviesByGenre = (genre, page = 0, size = 12) =>
  api.get('/api/movies/getmoviebygenre', { params: { genre, page, size } }).then((r) => r.data)

// GET /api/movies/getmoviebylanguage?language&page&size (public)
export const getMoviesByLanguage = (language, page = 0, size = 12) =>
  api.get('/api/movies/getmoviebylanguage', { params: { language, page, size } }).then((r) => r.data)

// GET /api/movies/getmoviebytitle?title&page&size (public)
export const getMoviesByTitle = (title, page = 0, size = 12) =>
  api.get('/api/movies/getmoviebytitle', { params: { title, page, size } }).then((r) => r.data)

// POST /api/movies/addMovie (ADMIN)
export const addMovie = (movieDTO) => api.post('/api/movies/addMovie', movieDTO).then((r) => r.data)

// PUT /api/movies/updateMovie/{id} (ADMIN)
export const updateMovie = (id, movieDTO) => api.put(`/api/movies/updateMovie/${id}`, movieDTO).then((r) => r.data)

// DELETE /api/movies/deletemovie/{id} (ADMIN)
export const deleteMovie = (id) => api.delete(`/api/movies/deletemovie/${id}`).then((r) => r.data)
