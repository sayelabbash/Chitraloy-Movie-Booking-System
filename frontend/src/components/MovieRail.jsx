import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import MovieCard from './MovieCard'

export default function MovieRail({ movies = [] }) {
  const ref = useRef(null)

  function scroll(dir) {
    if (!ref.current) return
    ref.current.scrollBy({ left: dir * 340, behavior: 'smooth' })
  }

  if (!movies.length) return null

  return (
    <div className="group/rail relative">
      <button
        onClick={() => scroll(-1)}
        className="focus-ring absolute -left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 shadow-card hover:text-brand-600 group-hover/rail:sm:flex"
      >
        <ChevronLeft size={18} />
      </button>
      <div ref={ref} className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-1">
        {movies.map((m) => (
          <div key={m.id} className="w-36 shrink-0 sm:w-44">
            <MovieCard movie={m} />
          </div>
        ))}
      </div>
      <button
        onClick={() => scroll(1)}
        className="focus-ring absolute -right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 shadow-card hover:text-brand-600 group-hover/rail:sm:flex"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
