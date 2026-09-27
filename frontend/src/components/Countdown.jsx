import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'

export default function Countdown({ deadline, onExpire }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, deadline - Date.now()))

  useEffect(() => {
    if (!deadline) return
    const id = setInterval(() => {
      const rem = Math.max(0, deadline - Date.now())
      setRemaining(rem)
      if (rem <= 0) {
        clearInterval(id)
        onExpire?.()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [deadline, onExpire])

  const mins = Math.floor(remaining / 60000)
  const secs = Math.floor((remaining % 60000) / 1000)
  const urgent = remaining < 60000

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold ${
        urgent
          ? 'border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400 animate-pulse'
          : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
      }`}
    >
      <Timer size={14} /> Seats held for {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  )
}
