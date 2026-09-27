import MovieCard from './MovieCard'
import EmptyState from './EmptyState'

export default function MovieGrid({ movies }) {
  if (!movies || movies.length === 0) {
    return <EmptyState title="No movies found" message="Try a different search or check back later for new releases." />
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((m) => (
        <div key={m.id} className="w-full">
          <MovieCard movie={m} />
        </div>
      ))}
    </div>
  )
}
