import { Film } from 'lucide-react'

export default function EmptyState({ icon: Icon = Film, title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-200 dark:border-ink-800 bg-white/60 dark:bg-ink-900/60 p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 text-ink-400 dark:text-ink-500">
        <Icon size={26} />
      </div>
      <h3 className="text-base font-semibold text-ink-800 dark:text-ink-100">{title}</h3>
      {message && <p className="max-w-sm text-sm text-ink-500 dark:text-ink-400">{message}</p>}
      {action}
    </div>
  )
}
