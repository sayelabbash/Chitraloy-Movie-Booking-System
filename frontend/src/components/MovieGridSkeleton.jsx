export function MovieCardSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="aspect-[2/3] rounded-xl bg-ink-200 dark:bg-ink-800" />
      <div className="mt-2 h-3.5 w-4/5 rounded bg-ink-200 dark:bg-ink-800" />
      <div className="mt-1.5 h-3 w-3/5 rounded bg-ink-100 dark:bg-ink-800" />
    </div>
  )
}

export default function MovieGridSkeleton({ count = 10 }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  )
}
