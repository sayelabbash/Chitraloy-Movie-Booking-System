import { Clapperboard } from 'lucide-react'

export default function LoadingSpinner({ size = 20, className = '' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export function PageSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-ink-400 dark:text-ink-500">
      <div className="relative">
        <Clapperboard size={34} className="animate-pulse text-brand-600" />
      </div>
      <p className="text-sm font-medium">{label}</p>
    </div>
  )
}
