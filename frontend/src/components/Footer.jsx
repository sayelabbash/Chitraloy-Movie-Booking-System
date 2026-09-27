import { Clapperboard, Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900">
      <div className="container-page py-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Clapperboard size={15} />
            </span>
            <span className="font-display text-lg font-extrabold text-ink-900 dark:text-ink-50">
              Show<span className="text-brand-600">Time</span>
            </span>
          </div>
          <p className="text-center text-xs text-ink-400 dark:text-ink-500 sm:text-sm">
            Book your favourite movies in a few taps. Fast seat selection, secure payments.
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="focus-ring flex items-center gap-1.5 text-xs font-semibold text-ink-500 dark:text-ink-400 hover:text-brand-600"
          >
            <Github size={14} /> Source
          </a>
        </div>
        <div className="mt-6 border-t border-ink-100 dark:border-ink-800 pt-6 text-center text-xs text-ink-400 dark:text-ink-500">
          © {new Date().getFullYear()} ShowTime. Built for the movies you love.
        </div>
      </div>
    </footer>
  )
}
