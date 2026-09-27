import { useEffect, useState } from 'react'
import { Ticket } from 'lucide-react'
import { getBookingsByStatus } from '../../api/bookings'
import { PageSpinner } from '../../components/LoadingSpinner'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import { getErrorMessage } from '../../lib/api'
import { formatCurrencyINR, formatDateTime } from '../../lib/format'

const STATUSES = ['CONFIRMED', 'PENDING', 'CANCELLED']

export default function AdminBookings() {
  const [statusFilter, setStatusFilter] = useState('CONFIRMED')
  const [bookings, setBookings] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  async function load() {
    setStatus('loading')
    try {
      const res = await getBookingsByStatus(statusFilter)
      setBookings(res || [])
      setStatus('ready')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load bookings.'))
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const total = bookings.reduce((sum, b) => sum + Number(b.price || 0), 0)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">Bookings</h1>
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                statusFilter === s ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 hover:border-brand-300 dark:hover:border-brand-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {status === 'loading' && <PageSpinner label="Loading bookings…" />}
      {status === 'error' && <ErrorState message={error} onRetry={load} />}
      {status === 'ready' && bookings.length === 0 && (
        <EmptyState icon={Ticket} title={`No ${statusFilter.toLowerCase()} bookings`} message="Bookings with this status will appear here." />
      )}
      {status === 'ready' && bookings.length > 0 && (
        <>
          <div className="mb-4 rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 px-5 py-3 text-sm text-ink-600 dark:text-ink-300 shadow-card">
            {bookings.length} bookings · <span className="font-bold text-ink-900 dark:text-ink-50">{formatCurrencyINR(total)}</span> total
          </div>
          <div className="overflow-x-auto rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-card">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-ink-50 dark:bg-ink-950 text-xs uppercase tracking-wide text-ink-400 dark:text-ink-500">
                <tr>
                  <th className="px-4 py-3">Booking</th>
                  <th className="px-4 py-3">Movie</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Seats</th>
                  <th className="px-4 py-3">Booked at</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-ink-50/60 dark:hover:bg-ink-800/60">
                    <td className="px-4 py-3 font-mono text-xs text-ink-500 dark:text-ink-400">#{b.id}</td>
                    <td className="px-4 py-3 font-semibold text-ink-900 dark:text-ink-50">{b.show?.movie?.name}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{b.user?.username || b.userId}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{b.seatNumbers?.join(', ')}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{formatDateTime(b.bookingTime)}</td>
                    <td className="px-4 py-3 font-semibold text-ink-900 dark:text-ink-50">{formatCurrencyINR(b.price)}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.bookingStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
