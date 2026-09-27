const STYLES = {
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  CANCELLED: 'bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400 border-ink-200 dark:border-ink-800',
  SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  FAILED: 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-800',
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  LOCKED: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  BOOKED: 'bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400 border-ink-200 dark:border-ink-800',
}

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 border-ink-200 dark:border-ink-800'
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {status}
    </span>
  )
}
