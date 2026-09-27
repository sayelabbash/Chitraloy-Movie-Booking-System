import { useState } from 'react'
import { Clapperboard } from 'lucide-react'

export default function PosterImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-ink-200 to-ink-300 text-ink-500 dark:text-ink-400 ${className}`}>
        <Clapperboard size={32} strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
