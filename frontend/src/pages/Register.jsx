import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Clapperboard, Lock, User, Mail, Eye, EyeOff, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../lib/api'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  function validate() {
    const errs = {}
    if (form.username.trim().length < 3) errs.username = 'Username must be at least 3 characters'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address'
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await register({ username: form.username.trim(), email: form.email.trim(), password: form.password })
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not create your account.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-ink-50 dark:bg-ink-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-pop">
            <Clapperboard size={24} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">Create your account</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Join ShowTime and start booking in minutes.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 shadow-card">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Username</label>
            <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 transition ${errors.username ? 'border-brand-400' : 'border-ink-200 dark:border-ink-800 focus-within:border-brand-400 dark:focus-within:border-brand-600'}`}>
              <User size={16} className="text-ink-400 dark:text-ink-500" />
              <input
                autoFocus
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="yourusername"
              />
            </div>
            {errors.username && <p className="mt-1 text-xs text-brand-600">{errors.username}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Email</label>
            <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 transition ${errors.email ? 'border-brand-400' : 'border-ink-200 dark:border-ink-800 focus-within:border-brand-400 dark:focus-within:border-brand-600'}`}>
              <Mail size={16} className="text-ink-400 dark:text-ink-500" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-brand-600">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Password</label>
            <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 transition ${errors.password ? 'border-brand-400' : 'border-ink-200 dark:border-ink-800 focus-within:border-brand-400 dark:focus-within:border-brand-600'}`}>
              <Lock size={16} className="text-ink-400 dark:text-ink-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="At least 8 characters"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-200">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-brand-600">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="focus-ring flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserPlus size={16} /> {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
          Already have an account?{' '}
          <Link to="/login" className="focus-ring font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
