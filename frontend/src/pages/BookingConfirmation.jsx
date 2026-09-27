import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Printer, Home } from 'lucide-react'
import { getMyBookings } from '../api/bookings'
import { PageSpinner } from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'
import BookingTicket from '../components/BookingTicket'
import { getErrorMessage } from '../lib/api'

export default function BookingConfirmation() {
  const { bookingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [booking, setBooking] = useState(location.state?.booking || null)
  const [status, setStatus] = useState(booking ? 'ready' : 'loading')
  const [error, setError] = useState('')

  async function load() {
    setStatus('loading')
    try {
      const mine = await getMyBookings()
      const found = mine.find((b) => String(b.id) === String(bookingId))
      if (!found) {
        setError('This booking could not be found.')
        setStatus('error')
        return
      }
      setBooking(found)
      setStatus('ready')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load this booking.'))
      setStatus('error')
    }
  }

  useEffect(() => {
    if (!booking) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === 'loading') return <PageSpinner label="Loading your ticket…" />
  if (status === 'error')
    return (
      <div className="container-page py-16">
        <ErrorState message={error} onRetry={load} />
      </div>
    )
  if (!booking) return null

  return (
    <div className="container-page max-w-2xl py-10">
      <div className="no-print mb-8 flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
          <CheckCircle2 size={34} />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">Booking Confirmed!</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Your tickets are ready. Enjoy the show 🎬</p>
      </div>

      <BookingTicket booking={booking} printable />

      <div className="no-print mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => window.print()}
          className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-full border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 px-5 py-3 text-sm font-bold text-ink-700 dark:text-ink-200 transition hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600"
        >
          <Printer size={16} /> Download / Print ticket
        </button>
        <button
          onClick={() => navigate('/')}
          className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          <Home size={16} /> Back to home
        </button>
      </div>
      <p className="no-print mt-4 text-center text-xs text-ink-400 dark:text-ink-500">
        Tip: choose "Save as PDF" in the print dialog to download your ticket.
      </p>
    </div>
  )
}
