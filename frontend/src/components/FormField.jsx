export default function FormField({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-brand-600">{error}</p>}
    </div>
  )
}

export const inputClass = (hasError) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 dark:bg-ink-950 dark:text-ink-50 dark:placeholder:text-ink-600 ${
    hasError ? 'border-brand-400' : 'border-ink-200 dark:border-ink-800 focus:border-brand-400 dark:focus:border-brand-600'
  }`
