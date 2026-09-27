import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Building2, MapPin, Users2 } from 'lucide-react'
import { getAllTheaters, addTheater, updateTheater, deleteTheater } from '../../api/theaters'
import { PageSpinner } from '../../components/LoadingSpinner'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import FormField, { inputClass } from '../../components/FormField'
import { getErrorMessage } from '../../lib/api'

const EMPTY_FORM = { theaterName: '', theaterLocation: '', theaterCapacity: '', theaterScreenType: '' }
const SCREEN_TYPES = ['2D', '3D', 'IMAX', '4DX', 'Dolby Atmos']

export default function AdminTheaters() {
  const [theaters, setTheaters] = useState([])
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
      const res = await getAllTheaters()
      setTheaters(res || [])
      setStatus('ready')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load theaters.'))
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

  function openEdit(theater) {
    setEditing(theater)
    setForm({
      theaterName: theater.theaterName || '',
      theaterLocation: theater.theaterLocation || '',
      theaterCapacity: theater.theaterCapacity ?? '',
      theaterScreenType: theater.theaterScreenType || '',
    })
    setErrors({})
    setModalOpen(true)
  }

  function validate() {
    const e = {}
    if (!form.theaterName.trim()) e.theaterName = 'Required'
    if (!form.theaterLocation.trim()) e.theaterLocation = 'Required'
    if (!form.theaterCapacity || Number(form.theaterCapacity) <= 0) e.theaterCapacity = 'Enter a number > 0'
    if (!form.theaterScreenType.trim()) e.theaterScreenType = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const payload = { ...form, theaterCapacity: Number(form.theaterCapacity) }
    try {
      if (editing) {
        await updateTheater(editing.id, payload)
        toast.success('Theater updated.')
      } else {
        await addTheater(payload)
        toast.success('Theater added.')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save this theater.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteTheater(deleteTarget.id)
      toast.success('Theater deleted successfully.')
      setDeleteTarget(null)
      load()
    } catch (err) {
      if (err?.response?.status === 409 || err?.response?.status === 500) {
        toast.error('Unable to delete this theater because it has existing shows or bookings.')
      } else {
        toast.error(getErrorMessage(err, 'Could not delete this theater.'))
      }
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">Theaters</h1>
        <button
          onClick={openCreate}
          className="focus-ring flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
        >
          <Plus size={16} /> Add theater
        </button>
      </div>

      {status === 'loading' && <PageSpinner label="Loading theaters…" />}
      {status === 'error' && <ErrorState message={error} onRetry={load} />}
      {status === 'ready' && theaters.length === 0 && (
        <EmptyState icon={Building2} title="No theaters yet" message="Add your first theater to start scheduling shows." />
      )}
      {status === 'ready' && theaters.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {theaters.map((t) => (
            <div key={t.id} className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600">
                  <Building2 size={18} />
                </div>
                <span className="rounded-full bg-ink-100 dark:bg-ink-800 px-2.5 py-1 text-xs font-bold text-ink-600 dark:text-ink-300">{t.theaterScreenType}</span>
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-ink-900 dark:text-ink-50">{t.theaterName}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
                <MapPin size={12} /> {t.theaterLocation}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
                <Users2 size={12} /> Capacity {t.theaterCapacity}
              </p>
              <div className="mt-4 flex justify-end gap-2 border-t border-ink-100 dark:border-ink-800 pt-3">
                <button onClick={() => openEdit(t)} className="focus-ring rounded-lg p-2 text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-brand-600">
                  <Pencil size={15} />
                </button>
                <button onClick={() => setDeleteTarget(t)} className="focus-ring rounded-lg p-2 text-ink-500 dark:text-ink-400 hover:bg-brand-50 dark:hover:bg-brand-950 hover:text-brand-600">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit theater' : 'Add theater'}>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="Theater name" error={errors.theaterName}>
            <input className={inputClass(errors.theaterName)} value={form.theaterName} onChange={(e) => setForm({ ...form, theaterName: e.target.value })} />
          </FormField>
          <FormField label="Location" error={errors.theaterLocation}>
            <input className={inputClass(errors.theaterLocation)} value={form.theaterLocation} onChange={(e) => setForm({ ...form, theaterLocation: e.target.value })} placeholder="City / area" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Capacity" error={errors.theaterCapacity}>
              <input type="number" min="1" className={inputClass(errors.theaterCapacity)} value={form.theaterCapacity} onChange={(e) => setForm({ ...form, theaterCapacity: e.target.value })} />
            </FormField>
            <FormField label="Screen type" error={errors.theaterScreenType}>
              <select className={inputClass(errors.theaterScreenType)} value={form.theaterScreenType} onChange={(e) => setForm({ ...form, theaterScreenType: e.target.value })}>
                <option value="">Select…</option>
                {SCREEN_TYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="focus-ring rounded-full border border-ink-200 dark:border-ink-800 px-4 py-2 text-sm font-semibold text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="focus-ring rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add theater'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete theater?">
        <p className="text-sm text-ink-600 dark:text-ink-300">
          Delete <span className="font-semibold text-ink-900 dark:text-ink-50">{deleteTarget?.theaterName}</span>? This cannot be undone.
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
