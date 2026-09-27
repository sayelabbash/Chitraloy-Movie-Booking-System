import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Armchair, Calendar, Clock, MapPin } from 'lucide-react'
import { getShowById } from '../api/shows'
import { getSeatsForShow } from '../api/seats'
import { createBooking } from '../api/bookings'
import SeatMap from '../components/SeatMap'
import { PageSpinner } from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'
import { formatCurrencyINR, formatDate, formatTime } from '../lib/format'
import { getErrorMessage } from '../lib/api'

// Matches booking.limits.max-seats-per-booking on the backend (see application.properties).
const MAX_SEATS = 6

export default function SeatSelection() {
  const { showId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [show, setShow] = useState(location.state?.show || null)
  const [movie, setMovie] = useState(location.state?.movie || location.state?.show?.movie || null)
  const [seats, setSeats] = useState([])
  const [selected, setSelected] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setStatus('loading')
    try {
      const [showData, seatData] = await Promise.all([
        show ? Promise.resolve(show) : getShowById(showId),
        getSeatsForShow(showId),
      ])
      setShow(showData)
      setMovie(movie || showData.movie)
      setSeats(seatData || [])
      setStatus('ready')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load seats for this show.'))
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showId])

  function toggleSeat(seatNumber) {
    setSelected((prev) => {
      if (prev.includes(seatNumber)) return prev.filter((s) => s !== seatNumber)
      if (prev.length >= MAX_SEATS) {
        toast.error(`You can select up to ${MAX_SEATS} seats per booking.`)
        return prev
      }
      return [...prev, seatNumber]
    })
  }

  const total = useMemo(() => (show ? Number(show.price) * selected.length : 0), [show, selected])

  async function handleConfirm() {
    if (selected.length === 0) {
      toast.error('Select at least one seat to continue.')
      return
    }
    setSubmitting(true)
    try {
      const booking = await createBooking({ seatNumbers: selected, showId: Number(showId) })
      toast.success('Booking created. Your seats are held for 5 minutes — complete payment to confirm.')
      navigate(`/bookings/${booking.id}/payment`, { state: { booking, show, movie } })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not create your booking.'))
      if ([409, 400].includes(err?.response?.status)) load()
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') return <PageSpinner label="Setting up the seat map…" />
  if (status === 'error')
    return (
      <div className="container-page py-16">
        <ErrorState message={error} onRetry={load} />
      </div>
    )
  if (!show) return null

  return (
    <div className="container-page py-8 pb-32 sm:pb-10">
      <button onClick={() => navigate(-1)} className="focus-ring mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 dark:text-ink-400 hover:text-brand-600">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50 sm:text-2xl">{movie?.name || 'Select your seats'}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500 dark:text-ink-400">
            <span className="flex items-center gap-1.5"><MapPin size={13} /> {show.theater?.theaterName}</span>
            <span className="flex items-center gap-1.5"><Calendar size={13} /> {formatDate(show.showTime)}</span>
            <span className="flex items-center gap-1.5"><Clock size={13} /> {formatTime(show.showTime)}</span>
          </div>
        </div>
        <div className="text-sm font-bold text-brand-600">{formatCurrencyINR(show.price)} / seat</div>
      </div>

      {seats.length === 0 ? (
        <ErrorState message="Seats haven't been set up for this show yet. Please check back soon." />
      ) : (
        <SeatMap seats={seats} selected={selected} onToggle={toggleSeat} maxSeats={MAX_SEATS} />
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white/95 backdrop-blur dark:border-ink-800 dark:bg-ink-900/95 sm:static sm:mt-8 sm:rounded-2xl sm:border sm:shadow-card">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3 text-sm">
            <Armchair size={18} className="text-brand-600" />
            <div>
              <p className="font-semibold text-ink-900 dark:text-ink-50">
                {selected.length} seat{selected.length !== 1 ? 's' : ''} selected
                {selected.length > 0 && <span className="ml-1.5 font-normal text-ink-400 dark:text-ink-500">({selected.join(', ')})</span>}
              </p>
              <p className="text-xs text-ink-400 dark:text-ink-500">Max {MAX_SEATS} seats per booking</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-display text-lg font-extrabold text-brand-600">{formatCurrencyINR(total)}</span>
            <button
              onClick={handleConfirm}
              disabled={selected.length === 0 || submitting}
              className="focus-ring rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? 'Holding seats…' : 'Proceed to pay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
