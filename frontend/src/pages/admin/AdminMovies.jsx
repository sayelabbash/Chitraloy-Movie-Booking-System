import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Clapperboard } from 'lucide-react'
import { getAllMovies, addMovie, updateMovie, deleteMovie } from '../../api/movies'
import { PageSpinner } from '../../components/LoadingSpinner'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'
import PosterImage from '../../components/PosterImage'
import FormField, { inputClass } from '../../components/FormField'
import { getErrorMessage } from '../../lib/api'
import { formatDuration } from '../../lib/format'

const EMPTY_FORM = { name: '', description: '', genre: '', language: '', duration: '', releaseDate: '', posterUrl: '' }

export default function AdminMovies() {
  const [data, setData] = useState({ content: [], totalPages: 0 })
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  async function load() {
    setStatus('loading')
    try {
      const res = await getAllMovies(page, 10)
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
  }, [page])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(movie) {
    setEditing(movie)
    setForm({
      name: movie.name || '',
      description: movie.description || '',
      genre: movie.genre || '',
      language: movie.language || '',
      duration: movie.duration ?? '',
      releaseDate: movie.releaseDate || '',
      posterUrl: movie.posterUrl || '',
    })
    setErrors({})
    setModalOpen(true)
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.description.trim()) e.description = 'Required'
    if (!form.genre.trim()) e.genre = 'Required'
    if (!form.language.trim()) e.language = 'Required'
    if (!form.duration || Number(form.duration) <= 0) e.duration = 'Enter minutes > 0'
    if (!form.releaseDate) e.releaseDate = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const payload = { ...form, duration: Number(form.duration) }
    try {
      if (editing) {
        await updateMovie(editing.id, payload)
        toast.success('Movie updated.')
      } else {
        await addMovie(payload)
        toast.success('Movie added.')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save this movie.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteMovie(deleteTarget.id)
      toast.success('Movie deleted successfully.')
      setDeleteTarget(null)
      load()
    } catch (err) {
      if (err?.response?.status === 409 || err?.response?.status === 500) {
        toast.error('Unable to delete this movie because it has existing shows or bookings.')
      } else {
        toast.error(getErrorMessage(err, 'Could not delete this movie.'))
      }
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">Movies</h1>
        <button
          onClick={openCreate}
          className="focus-ring flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
        >
          <Plus size={16} /> Add movie
        </button>
      </div>

      {status === 'loading' && <PageSpinner label="Loading movies…" />}
      {status === 'error' && <ErrorState message={error} onRetry={load} />}
      {status === 'ready' && data.content.length === 0 && (
        <EmptyState icon={Clapperboard} title="No movies yet" message="Add your first movie to get started." />
      )}
      {status === 'ready' && data.content.length > 0 && (
        <>
          <div className="overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-50 dark:bg-ink-950 text-xs uppercase tracking-wide text-ink-400 dark:text-ink-500">
                <tr>
                  <th className="px-4 py-3">Movie</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Genre</th>
                  <th className="hidden px-4 py-3 md:table-cell">Language</th>
                  <th className="hidden px-4 py-3 md:table-cell">Duration</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {data.content.map((m) => (
                  <tr key={m.id} className="hover:bg-ink-50/60 dark:hover:bg-ink-800/60">
                    <td className="flex items-center gap-3 px-4 py-3">
                      <div className="h-12 w-9 shrink-0 overflow-hidden rounded-md bg-ink-100 dark:bg-ink-800">
                        <PosterImage src={m.posterUrl} alt={m.name} className="h-full w-full object-cover" />
                      </div>
                      <span className="font-semibold text-ink-900 dark:text-ink-50">{m.name}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-ink-600 dark:text-ink-300 sm:table-cell">{m.genre}</td>
                    <td className="hidden px-4 py-3 text-ink-600 dark:text-ink-300 md:table-cell">{m.language}</td>
                    <td className="hidden px-4 py-3 text-ink-600 dark:text-ink-300 md:table-cell">{formatDuration(m.duration)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(m)} className="focus-ring rounded-lg p-2 text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-brand-600">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(m)} className="focus-ring rounded-lg p-2 text-ink-500 dark:text-ink-400 hover:bg-brand-50 dark:hover:bg-brand-950 hover:text-brand-600">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <Pagination page={page} totalPages={data.totalPages || 0} onChange={setPage} />
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit movie' : 'Add movie'} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="Name" error={errors.name}>
            <input className={inputClass(errors.name)} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Description" error={errors.description}>
            <textarea rows={3} className={inputClass(errors.description)} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Genre" error={errors.genre}>
              <input className={inputClass(errors.genre)} value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} placeholder="Action" />
            </FormField>
            <FormField label="Language" error={errors.language}>
              <input className={inputClass(errors.language)} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="English" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Duration (minutes)" error={errors.duration}>
              <input type="number" min="1" className={inputClass(errors.duration)} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </FormField>
            <FormField label="Release date" error={errors.releaseDate}>
              <input type="date" className={inputClass(errors.releaseDate)} value={form.releaseDate} onChange={(e) => setForm({ ...form, releaseDate: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Poster URL">
            <input className={inputClass(false)} value={form.posterUrl} onChange={(e) => setForm({ ...form, posterUrl: e.target.value })} placeholder="https://…" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="focus-ring rounded-full border border-ink-200 dark:border-ink-800 px-4 py-2 text-sm font-semibold text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="focus-ring rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add movie'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete movie?">
        <p className="text-sm text-ink-600 dark:text-ink-300">
          Delete <span className="font-semibold text-ink-900 dark:text-ink-50">{deleteTarget?.name}</span>? This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setDeleteTarget(null)} className="focus-ring rounded-full border border-ink-200 dark:border-ink-800 px-4 py-2 text-sm font-semibold text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800">
            Cancel
          </button>
          <button onClick={handleDelete} className="focus-ring rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  )
}
