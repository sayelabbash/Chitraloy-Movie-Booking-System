import { createPortal } from 'react-dom'
import PosterImage from './PosterImage'
import StatusBadge from './StatusBadge'
import { formatCurrencyINR, formatDate, formatTime, formatDateTime } from '../lib/format'

/**
 * A single, reusable cinema e-ticket design.
 * Used identically by the My Bookings list and the Booking Confirmation page so both
 * screens feel like the same ticket system (per design spec).
 *
 * Only ever renders fields that actually exist on the booking/show/theater/movie objects
 * returned by the backend — nothing here is invented.
 *
 * When `printable` is set, a second, print-only copy of the ticket is portaled into
 * #print-root (a sibling of #root, declared in index.html). That copy always renders with
 * fixed light colors, independent of the on-screen theme, and print CSS (index.css) hides
 * #root entirely so only this one ticket ends up on the page. See index.css for why this
 * approach replaces the old visibility:hidden strategy.
 */
export default function BookingTicket({ booking, compact = false, actions, printable = false, className = '', notchBg = 'bg-ink-50 dark:bg-ink-950' }) {
  const printRoot = printable && typeof document !== 'undefined' ? document.getElementById('print-root') : null

  return (
    <div className={className}>
      <TicketCard booking={booking} compact={compact} actions={actions} notchBg={notchBg} />
      {printRoot &&
        createPortal(
          <div className="mx-auto max-w-xl bg-white p-6">
            <TicketCard booking={booking} printMode />
          </div>,
          printRoot,
        )}
    </div>
  )
}

function TicketCard({ booking, compact = false, actions, notchBg = 'bg-ink-50 dark:bg-ink-950', printMode = false }) {
  const show = booking?.show
  const movie = show?.movie
  const theater = show?.theater

  // printMode never uses dark: variants and never depends on the app's active theme — the
  // printed page must look the same whether the person was browsing in light or dark mode.
  const c = printMode
    ? {
        card: 'border-ink-200 bg-white',
        title: 'text-ink-900',
        theater: 'text-ink-700',
        theaterSub: 'text-ink-400',
        metaRow: 'text-ink-500',
        metaStrong: 'text-ink-800',
        pill: 'bg-ink-100 text-ink-500',
        divider: 'border-ink-300',
        label: 'text-ink-400',
        value: 'text-ink-900',
        footerBorder: 'border-ink-100',
        total: 'text-brand-600',
        posterBg: 'bg-ink-100 ring-ink-200',
      }
    : {
        card: 'border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900',
        title: 'text-ink-900 dark:text-ink-50',
        theater: 'text-ink-700 dark:text-ink-200',
        theaterSub: 'text-ink-400 dark:text-ink-500',
        metaRow: 'text-ink-500 dark:text-ink-400',
        metaStrong: 'text-ink-800 dark:text-ink-100',
        pill: 'bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400',
        divider: 'border-ink-300 dark:border-ink-700',
        label: 'text-ink-400 dark:text-ink-500',
        value: 'text-ink-900 dark:text-ink-50',
        footerBorder: 'border-ink-100 dark:border-ink-800',
        total: 'text-brand-600',
        posterBg: 'bg-ink-100 dark:bg-ink-800 ring-ink-200 dark:ring-ink-700',
      }

  return (
    <div className={`relative overflow-hidden rounded-2xl border shadow-card ${c.card}`}>
      {/* Main info: poster + movie/theatre/date/time */}
      <div className={`flex gap-4 sm:gap-5 ${compact ? 'p-4 sm:p-5' : 'p-5 sm:p-7'}`}>
        <div className={`shrink-0 overflow-hidden rounded-xl ring-1 ${c.posterBg} ${compact ? 'h-24 w-16 sm:h-28 sm:w-20' : 'h-32 w-20 sm:h-40 sm:w-28'}`}>
          <PosterImage src={movie?.posterUrl} alt={movie?.name} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className={`truncate font-display font-bold ${c.title} ${compact ? 'text-base sm:text-lg' : 'text-lg sm:text-2xl'}`}>
              {movie?.name || 'Movie'}
            </h3>
            {booking?.bookingStatus && <StatusBadge status={booking.bookingStatus} />}
          </div>

          {theater && (
            <p className={`mt-1.5 truncate font-semibold ${c.theater} ${compact ? 'text-xs' : 'text-sm'}`}>
              {theater.theaterName}
              {theater.theaterLocation ? <span className={`font-normal ${c.theaterSub}`}> · {theater.theaterLocation}</span> : null}
            </p>
          )}

          {show?.showTime && (
            <div className={`mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 ${c.metaRow} ${compact ? 'text-xs' : 'text-sm'}`}>
              <span className={`font-semibold ${c.metaStrong}`}>{formatDate(show.showTime)}</span>
              <span>{formatTime(show.showTime)}</span>
              {theater?.theaterScreenType && (
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${c.pill}`}>{theater.theaterScreenType}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Perforated divider with punched-out ticket notches */}
      <div className="relative">
        <span className={`absolute left-0 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full ${printMode ? 'bg-white' : notchBg}`} aria-hidden="true" />
        <span className={`absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 translate-x-1/2 rounded-full ${printMode ? 'bg-white' : notchBg}`} aria-hidden="true" />
        <div className={`mx-5 border-t border-dashed sm:mx-7 ${c.divider}`} />
      </div>

      {/* Ticket / booking info footer */}
      <div className={`${compact ? 'p-4 sm:p-5' : 'p-5 sm:p-7'} pt-4 sm:pt-5`}>
        <div className={`grid gap-x-6 gap-y-3 ${compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
          {booking?.seatNumbers?.length > 0 && <TicketField label="Seats" value={booking.seatNumbers.join(', ')} c={c} />}
          {(booking?.numberOfSeats || booking?.numberOfSeats === 0) && <TicketField label="Tickets" value={booking.numberOfSeats} c={c} />}
          {booking?.id && <TicketField label="Booking ID" value={`#${booking.id}`} mono c={c} />}
          {booking?.bookingTime && !compact && <TicketField label="Booked on" value={formatDateTime(booking.bookingTime)} c={c} />}
        </div>

        <div className={`mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4 ${c.footerBorder}`}>
          <div>
            <p className={`text-[11px] uppercase tracking-wide ${c.label}`}>Total</p>
            <p className={`font-display font-extrabold ${c.total} ${compact ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>{formatCurrencyINR(booking?.price)}</p>
          </div>
          {actions && !printMode && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  )
}

function TicketField({ label, value, mono = false, c }) {
  return (
    <div>
      <p className={`text-[11px] uppercase tracking-wide ${c.label}`}>{label}</p>
      <p className={`mt-0.5 font-semibold ${c.value} ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}
