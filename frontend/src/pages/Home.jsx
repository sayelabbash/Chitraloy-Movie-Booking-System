import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlayCircle, MapPin, ChevronLeft, ChevronRight, TicketCheck } from 'lucide-react'
import { getAllMovies } from '../api/movies'
import ErrorState from '../components/ErrorState'
import MovieRail from '../components/MovieRail'
import MovieGridSkeleton from '../components/MovieGridSkeleton'
import PosterImage from '../components/PosterImage'
import { getErrorMessage } from '../lib/api'
import { formatDuration } from '../lib/format'

const GENRE_ICONS = ['🎬', '😂', '💥', '👻', '❤️', '🎭', '🚀', '🎵']

function HeroSlide({ movie }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink-950">
      <div className="absolute inset-0">
        <PosterImage src={movie.posterUrl} alt="" className="h-full w-full scale-110 object-cover opacity-30 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-transparent" />
      </div>
      <div className="relative z-10 flex flex-col items-start gap-4 p-6 sm:p-10 md:flex-row md:items-center md:gap-10">
        <div className="hidden aspect-[2/3] w-36 shrink-0 overflow-hidden rounded-xl shadow-2xl ring-4 ring-white/10 sm:block md:w-48">
          <PosterImage src={movie.posterUrl} alt={movie.name} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-600/90 px-3 py-1 text-xs font-bold text-white">
            <TicketCheck size={12} /> Now Showing
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">{movie.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-200">
            {movie.genre && <span>{movie.genre}</span>}
            {movie.language && <span>{movie.language}</span>}
            {movie.duration ? <span>{formatDuration(movie.duration)}</span> : null}
          </div>
          <p className="mt-4 line-clamp-2 max-w-xl text-sm text-ink-300">{movie.description}</p>
          <Link
            to={`/movies/${movie.id}`}
            className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-pop transition hover:bg-brand-700"
          >
            <PlayCircle size={18} /> Book tickets
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [movies, setMovies] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [slide, setSlide] = useState(0)

  async function load() {
    setStatus('loading')
    try {
      const data = await getAllMovies(0, 20)
      setMovies(data.content || [])
      setStatus('ready')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load movies right now.'))
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const heroMovies = useMemo(() => movies.slice(0, 5), [movies])

  useEffect(() => {
    if (heroMovies.length < 2) return
    const id = setInterval(() => setSlide((s) => (s + 1) % heroMovies.length), 5500)
    return () => clearInterval(id)
  }, [heroMovies.length])

  const genres = useMemo(() => {
    const set = new Set(movies.map((m) => m.genre).filter(Boolean))
    return Array.from(set).slice(0, 8)
  }, [movies])

  if (status === 'loading') {
    return (
      <div className="pb-16">
        <div className="container-page pt-6">
          <div className="aspect-[16/7] w-full animate-pulse rounded-3xl bg-ink-200 dark:bg-ink-800 sm:aspect-[16/6]" />
        </div>
        <div className="container-page mt-10">
          <div className="mb-4 h-6 w-48 animate-pulse rounded bg-ink-200 dark:bg-ink-800" />
          <MovieGridSkeleton count={6} />
        </div>
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div className="container-page py-16">
        <ErrorState message={error} onRetry={load} />
      </div>
    )
  }

  return (
    <div className="pb-16">
      <div className="container-page pt-6">
        {heroMovies.length > 0 && (
          <div className="relative">
            <HeroSlide movie={heroMovies[slide]} />
            {heroMovies.length > 1 && (
              <>
                <button
                  onClick={() => setSlide((s) => (s - 1 + heroMovies.length) % heroMovies.length)}
                  className="focus-ring absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 sm:flex"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setSlide((s) => (s + 1) % heroMovies.length)}
                  className="focus-ring absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 sm:flex"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {heroMovies.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSlide(i)}
                      className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-6 bg-brand-500' : 'w-1.5 bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {genres.length > 0 && (
        <div className="container-page mt-8">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {genres.map((g, i) => (
              <Link
                key={g}
                to={`/movies?genre=${encodeURIComponent(g)}`}
                className="focus-ring flex shrink-0 items-center gap-1.5 rounded-full border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 px-4 py-2 text-sm font-semibold text-ink-700 dark:text-ink-200 transition hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950 hover:text-brand-600"
              >
                <span>{GENRE_ICONS[i % GENRE_ICONS.length]}</span> {g}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="container-page mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50 sm:text-2xl">Recommended Movies</h2>
          <Link to="/movies" className="focus-ring text-sm font-semibold text-brand-600 hover:underline">
            See all
          </Link>
        </div>
        <MovieRail movies={movies} />
      </div>

      <div className="container-page mt-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: '🎟️', title: 'Instant booking', desc: 'Reserve your seats in seconds with a live seat map.' },
            { icon: '🔒', title: 'Secure payments', desc: 'Checkout safely with Razorpay-powered payments.' },
            { icon: MapPin, title: 'Theatres near you', desc: 'Find showtimes across all your favourite theatres.' },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5 shadow-card">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950 text-xl text-brand-600">
                {typeof f.icon === 'string' ? f.icon : <f.icon size={18} />}
              </span>
              <div>
                <h3 className="font-semibold text-ink-900 dark:text-ink-50">{f.title}</h3>
                <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
