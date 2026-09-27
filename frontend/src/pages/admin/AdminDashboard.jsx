import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clapperboard, Building2, CalendarClock, Ticket, ArrowRight } from 'lucide-react'
import { getAllMovies } from '../../api/movies'
import { getAllTheaters } from '../../api/theaters'
import { getAllShows } from '../../api/shows'
import { getBookingsByStatus } from '../../api/bookings'
import { PageSpinner } from '../../components/LoadingSpinner'
import { formatCurrencyINR } from '../../lib/format'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    async function load() {
      const [movies, theaters, shows, confirmed] = await Promise.allSettled([
        getAllMovies(0, 1),
        getAllTheaters(),
        getAllShows(),
        getBookingsByStatus('CONFIRMED'),
      ])
      const confirmedList = confirmed.status === 'fulfilled' ? confirmed.value : []
      const revenue = confirmedList.reduce((sum, b) => sum + Number(b.price || 0), 0)
      setStats({
        movies: movies.status === 'fulfilled' ? movies.value.totalElements : '—',
        theaters: theaters.status === 'fulfilled' ? theaters.value.length : '—',
        shows: shows.status === 'fulfilled' ? shows.value.length : '—',
        confirmedBookings: confirmedList.length,
        revenue,
      })
    }
    load()
  }, [])

  if (!stats) return <PageSpinner label="Loading dashboard…" />

  const CARDS = [
    { label: 'Movies', value: stats.movies, icon: Clapperboard, to: '/admin/movies', color: 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400' },
    { label: 'Theaters', value: stats.theaters, icon: Building2, to: '/admin/theaters', color: 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' },
    { label: 'Shows', value: stats.shows, icon: CalendarClock, to: '/admin/shows', color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
    { label: 'Confirmed Bookings', value: stats.confirmedBookings, icon: Ticket, to: '/admin/bookings', color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
  ]

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="group rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-pop"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.color}`}>
              <c.icon size={18} />
            </div>
            <p className="mt-4 font-display text-2xl font-extrabold text-ink-900 dark:text-ink-50">{c.value}</p>
            <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-ink-500 dark:text-ink-400 group-hover:text-brand-600 dark:group-hover:text-brand-400">
              {c.label} <ArrowRight size={13} className="opacity-0 transition group-hover:opacity-100" />
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-ink-200 dark:border-ink-800 bg-gradient-to-br from-ink-900 to-ink-800 p-6 text-white shadow-card">
        <p className="text-sm text-ink-300">Total confirmed revenue</p>
        <p className="mt-1 font-display text-3xl font-extrabold">{formatCurrencyINR(stats.revenue)}</p>
      </div>
    </div>
  )
}
