import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Calendar, Clock, Globe2, MapPin, Tag, Ticket, ArrowLeft } from 'lucide-react'
import { getAllMovies } from '../api/movies'
import { getShowsByMovie } from '../api/shows'
import PosterImage from '../components/PosterImage'
import { PageSpinner } from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import { formatCurrencyINR, formatDate, formatDuration, formatTime, formatWeekday, formatShortDate, groupBy } from '../lib/format'
import { getErrorMessage } from '../lib/api'

// There is no "get movie by id" endpoint on the backend, so a direct visit/refresh of this
// page resolves the movie from whichever public endpoint can surface it: first any show for
// this movie (which carries the movie embedded), then, as a fallback, a scan of the public
// paginated movie list.
async function resolveMovie(id, shows) {
  if (shows?.length) return shows[0].movie
  for (let page = 0; page < 15; page++) {
    const res = await getAllMovies(page, 20)
    const found = (res.content || []).find((m) => String(m.id) === String(id))
    if (found) return found
    if (res.last) break
  }
  return null
}

export default function MovieDetails() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [movie, setMovie] = useState(location.state?.movie || null)
  const [shows, setShows] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [activeDate, setActiveDate] = useState(null)

  async function load() {
    setStatus('loading')
    try {
      const showList = await getShowsByMovie(id)
      setShows(showList || [])
      const resolvedMovie = movie || (await resolveMovie(id, showList))
      if (!resolvedMovie) {
        setError('This movie could not be found.')
        setStatus('error')
        return
      }
      setMovie(resolvedMovie)
      setStatus('ready')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load this movie right now.'))
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const showsByDate = useMemo(() => {
    const upcoming = shows.filter((s) => new Date(s.showTime) > new Date())
    return groupBy(upcoming, (s) => formatDate(s.showTime))
  }, [shows])

  const dates = Object.keys(showsByDate)

  useEffect(() => {
    if (dates.length && !activeDate) setActiveDate(dates[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dates.length])

  const showsForDate = activeDate ? showsByDate[activeDate] || [] : []
  const byTheater = useMemo(() => groupBy(showsForDate, (s) => s.theater?.theaterName || 'Theatre'), [showsForDate])

  if (status === 'loading') return <PageSpinner label="Fetching movie details…" />
  if (status === 'error')
    return (
      <div className="container-page py-16">
        <ErrorState message={error} onRetry={load} />
      </div>
    )
  if (!movie) return null

  return (
    <div className="pb-16">
      <section className="relative overflow-hidden bg-ink-950">
        <div className="absolute inset-0">
          <PosterImage src={movie.posterUrl} alt="" className="h-full w-full scale-110 object-cover opacity-25 blur-md" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/90 to-ink-950/70" />
        </div>
        <div className="container-page relative z-10 py-8">
          <button onClick={() => navigate(-1)} className="focus-ring mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-300 hover:text-white">
            <ArrowLeft size={15} /> Back
          </button>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
            <div className="mx-auto w-44 shrink-0 overflow-hidden rounded-2xl shadow-2xl ring-4 ring-white/10 md:mx-0 md:w-full">
              <PosterImage src={movie.posterUrl} alt={`${movie.name} poster`} className="aspect-[2/3] w-full object-cover" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">{movie.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-300">
                <span className="flex items-center gap-1.5"><Tag size={14} /> {movie.genre}</span>
                <span className="flex items-center gap-1.5"><Globe2 size={14} /> {movie.language}</span>
                {(movie.duration || movie.duration === 0) && (
                  <span className="flex items-center gap-1.5"><Clock size={14} /> {formatDuration(movie.duration)}</span>
                )}
                {movie.releaseDate && (
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(movie.releaseDate)}</span>
                )}
              </div>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink-300">{movie.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page mt-10">
        <h2 className="mb-6 font-display text-xl font-bold text-ink-900 dark:text-ink-50 sm:text-2xl">Showtimes</h2>

        {dates.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No upcoming shows yet"
            message="Check back soon — new showtimes for this movie will appear here."
          />
        ) : (
          <>
            <div className="mb-8 flex gap-2 overflow-x-auto no-scrollbar">
              {dates.map((d) => {
                const sample = showsByDate[d][0]?.showTime
                return (
                  <button
                    key={d}
                    onClick={() => setActiveDate(d)}
                    className={`flex shrink-0 flex-col items-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                      activeDate === d
                        ? 'border-brand-600 bg-brand-600 text-white shadow-pop'
                        : 'border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    <span className="text-[11px] uppercase opacity-80">{formatWeekday(sample)}</span>
                    <span>{formatShortDate(sample)}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex flex-col gap-5">
              {Object.entries(byTheater).map(([theaterName, theaterShows]) => (
                <div key={theaterName} className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5 shadow-card">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-bold text-ink-900 dark:text-ink-50">{theaterName}</h3>
                      <p className="flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
                        <MapPin size={12} /> {theaterShows[0].theater?.theaterLocation} · {theaterShows[0].theater?.theaterScreenType}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {theaterShows
                      .sort((a, b) => new Date(a.showTime) - new Date(b.showTime))
                      .map((s) => (
                        <button
                          key={s.id}
                          onClick={() => navigate(`/shows/${s.id}/seats`, { state: { show: s, movie } })}
                          className="focus-ring group flex flex-col items-center rounded-xl border border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-950 px-4 py-2.5 text-sm font-semibold text-ink-700 dark:text-ink-200 transition hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 hover:text-brand-600"
                        >
                          {formatTime(s.showTime)}
                          <span className="text-[11px] font-normal text-ink-400 dark:text-ink-500 group-hover:text-brand-500 dark:group-hover:text-brand-400">{formatCurrencyINR(s.price)}</span>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
