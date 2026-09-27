import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-8 text-center shadow-card">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
        <AlertTriangle size={22} />
      </div>
      <p className="max-w-sm text-sm text-ink-500 dark:text-ink-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="focus-ring mt-1 inline-flex items-center gap-1.5 rounded-full border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 px-4 py-2 text-sm font-semibold text-ink-700 dark:text-ink-200 transition hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400"
        >
          <RotateCcw size={14} /> Try again
        </button>
      )}
    </div>
  )
}
