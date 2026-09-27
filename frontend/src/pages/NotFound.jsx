import { Link } from 'react-router-dom'
import { Clapperboard, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <Clapperboard size={48} className="text-ink-300" />
      <h1 className="mt-4 font-display text-5xl font-extrabold text-ink-900 dark:text-ink-50">404</h1>
      <p className="mt-2 text-ink-500 dark:text-ink-400">This scene doesn't exist. Let's get you back to the main feature.</p>
      <Link
        to="/"
        className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
      >
        <Home size={16} /> Back to home
      </Link>
    </div>
  )
}
