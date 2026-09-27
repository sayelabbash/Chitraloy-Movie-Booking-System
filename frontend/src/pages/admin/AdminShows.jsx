import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, CalendarClock, Armchair } from 'lucide-react'
import { getAllShows, createShow, updateShow, deleteShow } from '../../api/shows'
import { getAllMovies } from '../../api/movies'
import { getAllTheaters } from '../../api/theaters'
import { createSeatsForShow } from '../../api/seats'
import { PageSpinner } from '../../components/LoadingSpinner'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import FormField, { inputClass } from '../../components/FormField'
import { getErrorMessage } from '../../lib/api'
import { formatCurrencyINR, formatDateTime } from '../../lib/format'

const EMPTY_FORM = { movieId: '', theaterId: '', showTime: '', price: '' }

// The backend rejects any page size over 20 ("Page size must be between 1 and 20"), so the
// movie picker for this form can't just ask for one huge page. Walk pages of 20 instead until
// the backend reports the last page, capped so a runaway catalog can't spin forever.
async function fetchAllMoviesForPicker() {
  const all = []
  for (let page = 0; page < 25; page++) {
    const res = await getAllMovies(page, 20)
    all.push(...(res.content || []))
    if (res.last || !res.content?.length) break
  }
  return all
}

export default function AdminShows() {
  const [shows, setShows] = useState([])
  const [movies, setMovies] = useState([])
  const [theaters, setTheaters] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [seedingId, setSeedingId] = useState(null)

  async function load() {
    setStatus('loading')
    try {
      const [showList, movieList, theaterList] = await Promise.all([getAllShows(), fetchAllMoviesForPicker(), getAllTheaters()])
      setShows((showList || []).sort((a, b) => new Date(b.showTime) - new Date(a.showTime)))
      setMovies(movieList)
      setTheaters(theaterList || [])
      setStatus('ready')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load shows.'))
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(show) {
    setEditing(show)
    setForm({
      movieId: show.movie?.id ?? '',
      theaterId: show.theater?.id ?? '',
      showTime: show.showTime ? show.showTime.slice(0, 16) : '',
      price: show.price ?? '',
    })
    setErrors({})
    setModalOpen(true)
  }

  function validate() {
    const e = {}
    if (!form.movieId) e.movieId = 'Required'
    if (!form.theaterId) e.theaterId = 'Required'
    if (!form.showTime) e.showTime = 'Required'
    else if (new Date(form.showTime) <= new Date()) e.showTime = 'Must be in the future'
    if (!form.price || Number(form.price) <= 0) e.price = 'Enter a price > 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const payload = {
      movieId: Number(form.movieId),
      theaterId: Number(form.theaterId),
      showTime: form.showTime,
      price: Number(form.price),
    }
    try {
      if (editing) {
        await updateShow(editing.id, payload)
        toast.success('Show updated.')
      } else {
        await createShow(payload)
        toast.success('Show created. Now generate its seat layout.')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save this show.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteShow(deleteTarget.id)
      toast.success('Show deleted successfully.')
      setDeleteTarget(null)
      load()
    } catch (err) {
      // A show with existing seats/bookings usually can't be deleted (FK constraint on the
      // backend) — surface that plainly instead of a generic 409 message or a raw SQL error.
      if (err?.response?.status === 409 || err?.response?.status === 500) {
        toast.error('Unable to delete this show because it is associated with existing seats or bookings.')
      } else {
        toast.error(getErrorMessage(err, 'Could not delete this show.'))
      }
    }
  }

  async function handleGenerateSeats(show) {
    setSeedingId(show.id)
    try {
      await createSeatsForShow(show.id)
      toast.success('Seat layout generated for this show.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not generate seats (they may already exist).'))
    } finally {
      setSeedingId(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">Shows</h1>
        <button
          onClick={openCreate}
          className="focus-ring flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
        >
          <Plus size={16} /> Schedule show
        </button>
      </div>

      {status === 'loading' && <PageSpinner label="Loading shows…" />}
      {status === 'error' && <ErrorState message={error} onRetry={load} />}
      {status === 'ready' && shows.length === 0 && (
        <EmptyState icon={CalendarClock} title="No shows scheduled" message="Schedule a show to start selling tickets." />
      )}
      {status === 'ready' && shows.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-ink-50 dark:bg-ink-950 text-xs uppercase tracking-wide text-ink-400 dark:text-ink-500">
              <tr>
                <th className="px-4 py-3">Movie</th>
                <th className="px-4 py-3">Theater</th>
                <th className="px-4 py-3">Show time</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {shows.map((s) => (
                <tr key={s.id} className="hover:bg-ink-50/60 dark:hover:bg-ink-800/60">
                  <td className="px-4 py-3 font-semibold text-ink-900 dark:text-ink-50">{s.movie?.name}</td>
                  <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{s.theater?.theaterName}</td>
                  <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{formatDateTime(s.showTime)}</td>
                  <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{formatCurrencyINR(s.price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleGenerateSeats(s)}
                        disabled={seedingId === s.id}
                        title="Generate seat layout"
                        className="focus-ring rounded-lg p-2 text-ink-500 dark:text-ink-400 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
                      >
                        <Armchair size={15} />
                      </button>
                      <button onClick={() => openEdit(s)} className="focus-ring rounded-lg p-2 text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-brand-600">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(s)} className="focus-ring rounded-lg p-2 text-ink-500 dark:text-ink-400 hover:bg-brand-50 dark:hover:bg-brand-950 hover:text-brand-600">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit show' : 'Schedule show'}>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="Movie" error={errors.movieId}>
            <select className={inputClass(errors.movieId)} value={form.movieId} onChange={(e) => setForm({ ...form, movieId: e.target.value })}>
              <option value="">Select a movie…</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Theater" error={errors.theaterId}>
            <select className={inputClass(errors.theaterId)} value={form.theaterId} onChange={(e) => setForm({ ...form, theaterId: e.target.value })}>
              <option value="">Select a theater…</option>
              {theaters.map((t) => (
                <option key={t.id} value={t.id}>{t.theaterName} — {t.theaterLocation}</option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Show time" error={errors.showTime}>
              <input type="datetime-local" className={inputClass(errors.showTime)} value={form.showTime} onChange={(e) => setForm({ ...form, showTime: e.target.value })} />
            </FormField>
            <FormField label="Price (₹)" error={errors.price}>
              <input type="number" min="1" step="0.01" className={inputClass(errors.price)} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </FormField>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="focus-ring rounded-full border border-ink-200 dark:border-ink-800 px-4 py-2 text-sm font-semibold text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="focus-ring rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create show'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete show?">
        <p className="text-sm text-ink-600 dark:text-ink-300">
          Delete this show for <span className="font-semibold text-ink-900 dark:text-ink-50">{deleteTarget?.movie?.name}</span>? This cannot be undone.
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
