import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Ticket, Mail, XCircle, Eye, Printer } from 'lucide-react'
import { getMyBookings, cancelBooking } from '../api/bookings'
import { useAuth } from '../context/AuthContext'
import { PageSpinner } from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import BookingTicket from '../components/BookingTicket'
import Modal from '../components/Modal'
import { initials } from '../lib/format'
import { getErrorMessage } from '../lib/api'

const TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'CANCELLED', label: 'Cancelled' },
]

export default function Profile() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [tab, setTab] = useState('ALL')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [viewTarget, setViewTarget] = useState(null)

  async function load() {
    setStatus('loading')
    try {
      const data = await getMyBookings()
      setBookings((data || []).sort((a, b) => new Date(b.bookingTime) - new Date(a.bookingTime)))
      setStatus('ready')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load your bookings.'))
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(
    () => (tab === 'ALL' ? bookings : bookings.filter((b) => b.bookingStatus === tab)),
    [bookings, tab],
  )

  const counts = useMemo(() => {
    const c = { ALL: bookings.length }
    for (const t of TABS) if (t.key !== 'ALL') c[t.key] = bookings.filter((b) => b.bookingStatus === t.key).length
    return c
  }, [bookings])

  async function handleCancel() {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      await cancelBooking(cancelTarget.id)
      toast.success('Booking cancelled. Your seats have been released.')
      setCancelTarget(null)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not cancel this booking.'))
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="container-page py-8">
      <div className="mb-8 flex items-center gap-4 rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5 shadow-card sm:p-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-600 font-display text-lg font-bold text-white">
          {initials(user?.username || 'U')}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-bold text-ink-900 dark:text-ink-50 sm:text-xl">{user?.username}</h1>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-ink-500 dark:text-ink-400">
            <Mail size={13} /> {user?.email}
          </p>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <p className="font-display text-2xl font-extrabold text-ink-900 dark:text-ink-50">{counts.ALL || 0}</p>
          <p className="text-xs text-ink-400 dark:text-ink-500">Total bookings</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              tab === t.key ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 hover:border-brand-300 dark:hover:border-brand-700'
            }`}
          >
            {t.label}
            <span className={`rounded-full px-1.5 text-xs ${tab === t.key ? 'bg-white/20' : 'bg-ink-100 dark:bg-ink-800 text-ink-400 dark:text-ink-500'}`}>
              {counts[t.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {status === 'loading' && <PageSpinner label="Loading your bookings…" />}
      {status === 'error' && <ErrorState message={error} onRetry={load} />}
      {status === 'ready' && filtered.length === 0 && (
        <EmptyState
          icon={Ticket}
          title={tab === 'ALL' ? 'No bookings yet' : `No ${tab.toLowerCase()} bookings`}
          message="Movies you book will show up here as premium e-tickets."
        />
      )}
      {status === 'ready' && filtered.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map((b) => (
            <BookingTicket
              key={b.id}
              booking={b}
              compact
              actions={
                <>
                  <button
                    onClick={() => setViewTarget(b)}
                    className="focus-ring flex items-center gap-1 rounded-full border border-ink-200 dark:border-ink-800 px-3.5 py-1.5 text-xs font-bold text-ink-600 dark:text-ink-300 transition hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600"
                  >
                    <Eye size={13} /> View ticket
                  </button>
                  {b.bookingStatus === 'PENDING' && (
                    <Link
                      to={`/bookings/${b.id}/payment`}
                      state={{ booking: b }}
                      className="focus-ring flex items-center gap-1 rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-brand-700"
                    >
                      Pay now
                    </Link>
                  )}
                  {b.bookingStatus === 'CONFIRMED' && new Date(b.show?.showTime) > new Date() && (
                    <button
                      onClick={() => setCancelTarget(b)}
                      className="focus-ring flex items-center gap-1 rounded-full border border-ink-200 dark:border-ink-800 px-3.5 py-1.5 text-xs font-bold text-ink-500 dark:text-ink-400 transition hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600"
                    >
                      <XCircle size={13} /> Cancel
                    </button>
                  )}
                </>
              }
            />
          ))}
        </div>
      )}

      {/* Full-size, printable ticket viewer */}
      <Modal open={Boolean(viewTarget)} onClose={() => setViewTarget(null)} title="Your ticket" maxWidth="max-w-xl">
        {viewTarget && (
          <div>
            <BookingTicket booking={viewTarget} printable notchBg="bg-white dark:bg-ink-900" />
            <button
              onClick={() => window.print()}
              className="focus-ring no-print mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-ink-200 dark:border-ink-800 py-2.5 text-sm font-bold text-ink-700 dark:text-ink-200 transition hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600"
            >
              <Printer size={15} /> Print ticket
            </button>
          </div>
        )}
      </Modal>

      <Modal open={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} title="Cancel booking?">
        <p className="text-sm text-ink-600 dark:text-ink-300">
          Are you sure you want to cancel your booking for{' '}
          <span className="font-semibold text-ink-900 dark:text-ink-50">{cancelTarget?.show?.movie?.name}</span>? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setCancelTarget(null)}
            className="focus-ring rounded-full border border-ink-200 dark:border-ink-800 px-4 py-2 text-sm font-semibold text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800"
          >
            Keep booking
          </button>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="focus-ring rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {cancelling ? 'Cancelling…' : 'Yes, cancel'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
