import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Clapperboard, Search, User, LogOut, Ticket, LayoutDashboard, Menu, X, Home } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import { initials } from '../lib/format'

const navLinkClass = ({ isActive }) =>
  `focus-ring text-sm font-semibold transition ${
    isActive ? 'text-brand-600 dark:text-brand-400' : 'text-ink-600 dark:text-ink-300 hover:text-brand-600 dark:hover:text-brand-400'
  }`

const mobileLinkClass = ({ isActive }) =>
  `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
    isActive
      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400'
      : 'text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800'
  }`

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    navigate(query.trim() ? `/movies?q=${encodeURIComponent(query.trim())}` : '/movies')
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur dark:border-ink-800 dark:bg-ink-900/95">
      <div className="container-page flex h-16 items-center gap-4">
        {/* Logo also always navigates Home directly — never relies on browser back */}
        <NavLink to="/" className="flex shrink-0 items-center gap-1.5 focus-ring">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Clapperboard size={18} />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50">
            Show<span className="text-brand-600">Time</span>
          </span>
        </NavLink>

        <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl md:flex">
          <div className="flex w-full items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-4 py-2 transition focus-within:border-brand-400 dark:focus-within:border-brand-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100 dark:border-ink-800 dark:bg-ink-950 dark:focus-within:bg-ink-900">
            <Search size={16} className="text-ink-400 dark:text-ink-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for movies, genres…"
              className="w-full bg-transparent text-sm text-ink-800 outline-none placeholder:text-ink-400 dark:text-ink-100"
            />
          </div>
        </form>

        <nav className="ml-auto hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/movies" className={navLinkClass}>
            Movies
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/profile" className={navLinkClass}>
              My Bookings
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}

          <ThemeToggle />

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white"
              >
                {initials(user?.username || 'U')}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 w-52 animate-fadeIn rounded-xl border border-ink-200 bg-white p-1.5 shadow-xl dark:border-ink-800 dark:bg-ink-900">
                  <div className="border-b border-ink-100 px-3 py-2 dark:border-ink-800">
                    <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-50">{user?.username}</p>
                    <p className="truncate text-xs text-ink-400 dark:text-ink-500">{user?.email}</p>
                  </div>
                  <NavLink
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 dark:hover:bg-ink-800 dark:text-ink-200 dark:hover:bg-ink-800"
                  >
                    <Ticket size={15} /> My Bookings
                  </NavLink>
                  {isAdmin && (
                    <NavLink
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 dark:hover:bg-ink-800 dark:text-ink-200 dark:hover:bg-ink-800"
                    >
                      <LayoutDashboard size={15} /> Admin Dashboard
                    </NavLink>
                  )}
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      logout()
                      navigate('/')
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/login"
              className="focus-ring flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              <User size={15} /> Sign in
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button onClick={() => setMobileOpen((v) => !v)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} className="focus-ring rounded-lg p-2 text-ink-700 dark:text-ink-200">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink-200 bg-white px-4 py-4 dark:border-ink-800 dark:bg-ink-900 md:hidden">
          <form onSubmit={handleSearch} className="mb-4 flex items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-4 py-2 dark:border-ink-800 dark:bg-ink-950">
            <Search size={16} className="text-ink-400 dark:text-ink-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies…"
              className="w-full bg-transparent text-sm text-ink-800 outline-none dark:text-ink-100"
            />
          </form>
          <div className="flex flex-col gap-1">
            <NavLink to="/" end onClick={() => setMobileOpen(false)} className={mobileLinkClass}>
              <Home size={15} /> Home
            </NavLink>
            <NavLink to="/movies" onClick={() => setMobileOpen(false)} className={mobileLinkClass}>
              <Clapperboard size={15} /> Movies
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" onClick={() => setMobileOpen(false)} className={mobileLinkClass}>
                  <Ticket size={15} /> My Bookings
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" onClick={() => setMobileOpen(false)} className={mobileLinkClass}>
                    <LayoutDashboard size={15} /> Admin Dashboard
                  </NavLink>
                )}
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    logout()
                    navigate('/')
                  }}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950"
                >
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-1 rounded-full bg-brand-600 px-4 py-2.5 text-center text-sm font-bold text-white"
              >
                Sign in
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
