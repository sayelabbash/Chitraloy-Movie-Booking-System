import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * Renders as an anchored popover on sm+ screens and a slide-up bottom sheet on mobile.
 * Content and footer (Reset / Apply) are passed in as children so the caller keeps
 * control of the actual filter fields.
 */
export default function FilterSheet({ open, onClose, title = 'Filters', children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm animate-fadeIn" onClick={onClose} />

      {/* Mobile: bottom sheet */}
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] animate-slideUp overflow-y-auto rounded-t-3xl bg-white dark:bg-ink-900 p-5 shadow-2xl sm:hidden">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-ink-200 dark:bg-ink-800" />
        <SheetHeader title={title} onClose={onClose} />
        <div className="mt-4">{children}</div>
        {footer && <div className="mt-6 flex gap-3">{footer}</div>}
      </div>

      {/* Desktop: anchored popover */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        <div className="container-page relative h-0">
          <div className="pointer-events-auto absolute right-4 top-24 w-[22rem] animate-slideUp rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5 shadow-2xl lg:right-8">
            <SheetHeader title={title} onClose={onClose} />
            <div className="mt-4">{children}</div>
            {footer && <div className="mt-6 flex gap-3">{footer}</div>}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function SheetHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-display text-base font-bold text-ink-900 dark:text-ink-50">{title}</h3>
      <button onClick={onClose} aria-label="Close filters" className="focus-ring rounded-full p-1.5 text-ink-400 dark:text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-700 dark:hover:text-ink-200">
        <X size={18} />
      </button>
    </div>
  )
}
