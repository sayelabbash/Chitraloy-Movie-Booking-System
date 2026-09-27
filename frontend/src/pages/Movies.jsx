import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { getAllMovies, getMoviesByGenre, getMoviesByLanguage, getMoviesByTitle } from '../api/movies'
import MovieGrid from '../components/MovieGrid'
import Pagination from '../components/Pagination'
import FilterSheet from '../components/FilterSheet'
import MovieGridSkeleton from '../components/MovieGridSkeleton'
import ErrorState from '../components/ErrorState'
import { getErrorMessage } from '../lib/api'

const PAGE_SIZE = 15
const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi', 'Animation']
const LANGUAGES = ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Korean']

export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const genre = searchParams.get('genre') || ''
  const language = searchParams.get('language') || ''
  const page = Number(searchParams.get('page') || 0)

  const [searchInput, setSearchInput] = useState(q)
  const [data, setData] = useState({ content: [], totalPages: 0 })
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const [filterOpen, setFilterOpen] = useState(false)
  const [draftGenre, setDraftGenre] = useState(genre)
  const [draftLanguage, setDraftLanguage] = useState(language)

  async function load() {
    setStatus('loading')
    try {
      let res
      // The backend only supports filtering by one dimension at a time — search takes
      // priority, otherwise genre, otherwise language, otherwise the full catalogue.
      if (q) res = await getMoviesByTitle(q, page, PAGE_SIZE)
      else if (genre) res = await getMoviesByGenre(genre, page, PAGE_SIZE)
      else if (language) res = await getMoviesByLanguage(language, page, PAGE_SIZE)
      else res = await getAllMovies(page, PAGE_SIZE)
      setData(res)
      setStatus('ready')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load movies.'))
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, genre, language, page])

  useEffect(() => setSearchInput(q), [q])

  function updateParams(next) {
    const params = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([k, v]) => {
      if (v) params.set(k, v)
      else params.delete(k)
    })
    if (!('page' in next)) params.delete('page')
    setSearchParams(params)
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    updateParams({ q: searchInput.trim(), genre: '', language: '' })
  }

  function openFilters() {
    setDraftGenre(genre)
    setDraftLanguage(language)
    setFilterOpen(true)
  }

  function applyFilters() {
    updateParams({ genre: draftGenre, language: draftLanguage, q: '' })
    setSearchInput('')
    setFilterOpen(false)
  }

  function resetFilters() {
    setDraftGenre('')
    setDraftLanguage('')
  }

  const activeFilterCount = (genre ? 1 : 0) + (language ? 1 : 0)

  return (
    <div className="container-page py-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">Explore Movies</h1>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2 rounded-full border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 px-4 py-2.5 shadow-card focus-within:border-brand-400 dark:focus-within:border-brand-600">
          <Search size={16} className="shrink-0 text-ink-400 dark:text-ink-500" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search movies…"
            className="w-full bg-transparent text-sm outline-none"
          />
          {searchInput && (
            <button type="button" aria-label="Clear search" onClick={() => { setSearchInput(''); updateParams({ q: '' }) }} className="shrink-0 text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-200">
              <X size={15} />
            </button>
          )}
        </form>

        <button
          onClick={openFilters}
          className={`focus-ring flex shrink-0 items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition ${
            activeFilterCount > 0 ? 'border-brand-600 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400' : 'border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-700 dark:text-ink-200 hover:border-brand-300 dark:hover:border-brand-700'
          }`}
        >
          <SlidersHorizontal size={15} /> Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {(genre || language || q) && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {q && <FilterChip label={`“${q}”`} onRemove={() => updateParams({ q: '' })} />}
          {genre && <FilterChip label={genre} onRemove={() => updateParams({ genre: '' })} />}
          {language && <FilterChip label={language} onRemove={() => updateParams({ language: '' })} />}
          {(genre || language || q) && (
            <button
              onClick={() => { setSearchInput(''); updateParams({ q: '', genre: '', language: '' }) }}
              className="text-xs font-semibold text-ink-400 dark:text-ink-500 hover:text-brand-600"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {status === 'loading' && <MovieGridSkeleton count={PAGE_SIZE} />}
      {status === 'error' && <ErrorState message={error} onRetry={load} />}
      {status === 'ready' && (
        <>
          <MovieGrid movies={data.content} />
          <div className="mt-10">
            <Pagination page={page} totalPages={data.totalPages || 0} onChange={(p) => updateParams({ page: String(p) })} />
          </div>
        </>
      )}

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter movies"
        footer={
          <>
            <button
              onClick={resetFilters}
              className="focus-ring flex-1 rounded-full border border-ink-200 dark:border-ink-800 py-2.5 text-sm font-semibold text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="focus-ring flex-1 rounded-full bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
            >
              Apply
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400 dark:text-ink-500">Genre</p>
            <div className="flex flex-wrap gap-2">
              <ChipOption label="All" active={!draftGenre} onClick={() => setDraftGenre('')} />
              {GENRES.map((g) => (
                <ChipOption key={g} label={g} active={draftGenre === g} onClick={() => setDraftGenre(g)} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400 dark:text-ink-500">Language</p>
            <div className="flex flex-wrap gap-2">
              <ChipOption label="All" active={!draftLanguage} onClick={() => setDraftLanguage('')} />
              {LANGUAGES.map((l) => (
                <ChipOption key={l} label={l} active={draftLanguage === l} onClick={() => setDraftLanguage(l)} />
              ))}
            </div>
          </div>
        </div>
      </FilterSheet>
    </div>
  )
}

function ChipOption({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
        active ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 hover:border-brand-300 dark:hover:border-brand-700'
      }`}
    >
      {label}
    </button>
  )
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950 py-1.5 pl-3.5 pr-2 text-xs font-bold text-brand-700 dark:text-brand-400">
      {label}
      <button onClick={onRemove} className="rounded-full p-0.5 hover:bg-brand-100 dark:hover:bg-brand-900">
        <X size={12} />
      </button>
    </span>
  )
}
