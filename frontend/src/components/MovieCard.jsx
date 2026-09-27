import { Link } from 'react-router-dom'
import PosterImage from './PosterImage'
import { formatDuration } from '../lib/format'

export default function MovieCard({ movie }) {
  return (
    <Link
      to={`/movies/${movie.id}`}
      className="focus-ring group block w-full"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-ink-200 dark:bg-ink-800 shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-pop">
        <PosterImage
          src={movie.posterUrl}
          alt={movie.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        {movie.language && (
          <span className="absolute left-2 top-2 rounded-md bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
            {movie.language}
          </span>
        )}
      </div>
      <h3 className="mt-2 truncate text-sm font-semibold text-ink-900 dark:text-ink-50 group-hover:text-brand-600 dark:group-hover:text-brand-400">{movie.name}</h3>
      <p className="truncate text-xs text-ink-500 dark:text-ink-400">
        {movie.genre}
        {movie.duration ? ` \u00b7 ${formatDuration(movie.duration)}` : ''}
      </p>
    </Link>
  )
}
