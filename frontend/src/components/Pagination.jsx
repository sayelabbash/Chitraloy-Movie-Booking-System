import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const start = Math.max(0, Math.min(page - 2, totalPages - 5))
  const end = Math.min(totalPages, start + 5)
  for (let i = start; i < end; i++) pages.push(i)

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
        className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 transition hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-label={`Go to page ${p + 1}`}
          aria-current={p === page ? 'page' : undefined}
          className={`focus-ring flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
            p === page ? 'bg-brand-600 text-white shadow-pop' : 'border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600'
          }`}
        >
          {p + 1}
        </button>
      ))}
      <button
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
        className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 transition hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
