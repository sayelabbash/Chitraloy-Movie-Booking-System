import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Clapperboard, Building2, CalendarClock, Ticket, ShieldPlus, ArrowLeft } from 'lucide-react'

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/movies', label: 'Movies', icon: Clapperboard },
  { to: '/admin/theaters', label: 'Theaters', icon: Building2 },
  { to: '/admin/shows', label: 'Shows', icon: CalendarClock },
  { to: '/admin/bookings', label: 'Bookings', icon: Ticket },
  { to: '/admin/users', label: 'Admin Users', icon: ShieldPlus },
]

export default function AdminLayout() {
  return (
    <div className="container-page grid grid-cols-1 gap-6 py-8 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <NavLink to="/" className="focus-ring mb-4 hidden items-center gap-1.5 text-sm font-semibold text-ink-500 dark:text-ink-400 hover:text-brand-600 lg:flex">
          <ArrowLeft size={14} /> Back to site
        </NavLink>
        <nav className="flex gap-1.5 overflow-x-auto rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-1.5 shadow-card no-scrollbar lg:flex-col lg:overflow-visible">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  isActive ? 'bg-brand-600 text-white' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800'
                }`
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
