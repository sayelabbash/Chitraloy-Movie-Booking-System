import { useState } from 'react'
import toast from 'react-hot-toast'
import { ShieldPlus, User, Mail, Lock } from 'lucide-react'
import { registerAdminUser } from '../../api/admin'
import FormField, { inputClass } from '../../components/FormField'
import { getErrorMessage } from '../../lib/api'

const EMPTY_FORM = { username: '', email: '', password: '' }

export default function AdminUsers() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const e = {}
    if (form.username.trim().length < 3) e.username = 'At least 3 characters'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email'
    if (form.password.length < 8) e.password = 'At least 8 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await registerAdminUser(form)
      toast.success('New admin user created.')
      setForm(EMPTY_FORM)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not create this admin user.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">Admin Users</h1>
      <div className="max-w-md rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 shadow-card">
        <div className="mb-5 flex items-center gap-2 text-brand-600">
          <ShieldPlus size={20} />
          <h2 className="font-display text-base font-bold text-ink-900 dark:text-ink-50">Register a new admin</h2>
        </div>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="Username" error={errors.username}>
            <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 ${errors.username ? 'border-brand-400' : 'border-ink-200 dark:border-ink-800 focus-within:border-brand-400 dark:focus-within:border-brand-600'}`}>
              <User size={15} className="text-ink-400 dark:text-ink-500" />
              <input className="w-full bg-transparent text-sm outline-none" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
          </FormField>
          <FormField label="Email" error={errors.email}>
            <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 ${errors.email ? 'border-brand-400' : 'border-ink-200 dark:border-ink-800 focus-within:border-brand-400 dark:focus-within:border-brand-600'}`}>
              <Mail size={15} className="text-ink-400 dark:text-ink-500" />
              <input type="email" className="w-full bg-transparent text-sm outline-none" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </FormField>
          <FormField label="Password" error={errors.password}>
            <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 ${errors.password ? 'border-brand-400' : 'border-ink-200 dark:border-ink-800 focus-within:border-brand-400 dark:focus-within:border-brand-600'}`}>
              <Lock size={15} className="text-ink-400 dark:text-ink-500" />
              <input type="password" className="w-full bg-transparent text-sm outline-none" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          </FormField>
          <button
            type="submit"
            disabled={submitting}
            className="focus-ring w-full rounded-full bg-brand-600 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create admin user'}
          </button>
        </form>
      </div>
    </div>
  )
}
