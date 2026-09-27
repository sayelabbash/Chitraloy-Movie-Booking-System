import { useMemo } from 'react'

// Groups flat seat list (e.g. A1, A2, B1...) into rows by leading letter(s).
function groupSeatsByRow(seats) {
  const rows = {}
  for (const seat of seats) {
    const match = seat.seatNumber.match(/^([A-Za-z]+)(\d+)$/)
    const rowKey = match ? match[1] : seat.seatNumber
    const num = match ? Number(match[2]) : 0
    if (!rows[rowKey]) rows[rowKey] = []
    rows[rowKey].push({ ...seat, __num: num })
  }
  return Object.entries(rows)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([row, list]) => [row, list.sort((a, b) => a.__num - b.__num)])
}

function ScreenIndicator() {
  return (
    <div className="relative mx-auto mb-10 flex max-w-lg flex-col items-center">
      <div className="pointer-events-none absolute -top-4 h-10 w-full rounded-[100%] bg-brand-500/10 blur-2xl dark:bg-brand-500/20" aria-hidden="true" />
      <svg viewBox="0 0 400 36" className="h-7 w-full drop-shadow-sm" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="screenGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="15%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="85%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 8 28 Q 200 -6 392 28"
          fill="none"
          stroke="url(#screenGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="text-ink-300 dark:text-ink-600"
        />
      </svg>
      <p className="mt-2.5 text-[11px] font-bold uppercase tracking-[0.35em] text-ink-400 dark:text-ink-500">Screen</p>
    </div>
  )
}

function Seat({ seat, isSelected, onToggle }) {
  const isLocked = seat.status === 'LOCKED'
  const isBooked = seat.status === 'BOOKED'
  const isUnavailable = isLocked || isBooked

  const stateClass = isBooked
    ? 'cursor-not-allowed border-ink-200 bg-ink-100 text-ink-300 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-600'
    : isLocked
      ? 'cursor-not-allowed border-amber-300 bg-amber-100 text-amber-600 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
      : isSelected
        ? 'border-brand-600 bg-brand-600 text-white shadow-pop scale-105'
        : 'border-ink-300 bg-white text-ink-500 hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-600 hover:shadow-card dark:border-ink-600 dark:bg-ink-800 dark:text-ink-300 dark:hover:border-brand-500 dark:hover:text-brand-400'

  return (
    <button
      disabled={isUnavailable}
      onClick={() => onToggle(seat.seatNumber)}
      title={isBooked ? `${seat.seatNumber} · Sold` : isLocked ? `${seat.seatNumber} · Held by another user` : seat.seatNumber}
      aria-label={`Seat ${seat.seatNumber}${isUnavailable ? ', unavailable' : isSelected ? ', selected' : ', available'}`}
      className={`group relative flex h-7 w-7 shrink-0 items-center justify-center rounded-t-lg rounded-b-[5px] border text-[10px] font-bold transition-all duration-150 sm:h-8 sm:w-8 ${stateClass}`}
    >
      {/* Subtle backrest highlight to suggest a real seat silhouette */}
      <span className="pointer-events-none absolute top-0.5 h-1 w-3/5 rounded-full bg-current opacity-25" aria-hidden="true" />
      {seat.__num}
    </button>
  )
}

export default function SeatMap({ seats, selected, onToggle, maxSeats = 6 }) {
  const rows = useMemo(() => groupSeatsByRow(seats), [seats])

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card dark:border-ink-800 dark:bg-ink-900 sm:p-8">
      <ScreenIndicator />

      <div className="flex flex-col items-center gap-2 overflow-x-auto pb-2">
        {rows.map(([row, list]) => {
          // Split the row roughly in half so a central aisle appears for longer rows,
          // mirroring how real cinema seat maps are laid out.
          const mid = list.length >= 6 ? Math.ceil(list.length / 2) : list.length
          const left = list.slice(0, mid)
          const right = list.slice(mid)
          return (
            <div key={row} className="flex items-center gap-2.5">
              <span className="w-5 shrink-0 text-center text-xs font-bold text-ink-400 dark:text-ink-500">{row}</span>
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="flex gap-1.5 sm:gap-2">
                  {left.map((seat) => (
                    <Seat key={seat.id} seat={seat} isSelected={selected.includes(seat.seatNumber)} onToggle={onToggle} />
                  ))}
                </div>
                {right.length > 0 && (
                  <div className="flex gap-1.5 sm:gap-2">
                    {right.map((seat) => (
                      <Seat key={seat.id} seat={seat} isSelected={selected.includes(seat.seatNumber)} onToggle={onToggle} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs text-ink-500 dark:text-ink-400">
        <LegendDot className="border-ink-300 bg-white dark:border-ink-600 dark:bg-ink-800" label="Available" />
        <LegendDot className="border-brand-600 bg-brand-600" label="Selected" />
        <LegendDot className="border-amber-300 bg-amber-100 dark:border-amber-700 dark:bg-amber-900/40" label="Held by another user" />
        <LegendDot className="border-ink-200 bg-ink-100 dark:border-ink-700 dark:bg-ink-800" label="Sold" />
        <span className="font-semibold text-ink-600 dark:text-ink-300">Max {maxSeats} seats per booking</span>
      </div>
    </div>
  )
}

function LegendDot({ className, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3.5 w-3.5 rounded-full border-2 ${className}`} />
      {label}
    </span>
  )
}
