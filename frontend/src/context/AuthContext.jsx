import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import * as authApi from '../api/auth'
import { registerUnauthorizedHandler, TOKEN_KEY, USER_KEY } from '../lib/api'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [initializing, setInitializing] = useState(true)

  const persist = useCallback((jwtToken, userInfo) => {
    localStorage.setItem(TOKEN_KEY, jwtToken)
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
    setToken(jwtToken)
    setUser(userInfo)
  }, [])

  const clear = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      if (localStorage.getItem(TOKEN_KEY)) {
        toast.error('Your session has expired. Please log in again.')
      }
      clear()
    })
  }, [clear])

  // Keep the profile (id / email / roles) in sync with the backend in the background.
  useEffect(() => {
    let cancelled = false
    async function hydrate() {
      if (token) {
        try {
          const me = await authApi.getCurrentUser()
          if (!cancelled) {
            const info = { id: me.id, username: me.username, email: me.email, roles: Array.from(me.roles || []) }
            localStorage.setItem(USER_KEY, JSON.stringify(info))
            setUser(info)
          }
        } catch {
          if (!cancelled) clear()
        }
      }
      if (!cancelled) setInitializing(false)
    }
    hydrate()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(
    async (username, password) => {
      const res = await authApi.login({ username, password })
      const roles = Array.from(res.roles || [])
      let info = { username: res.username, roles }
      try {
        const me = await authApi.getCurrentUser()
        info = { id: me.id, username: me.username, email: me.email, roles: Array.from(me.roles || roles) }
      } catch {
        // fall back to login payload if /me fails transiently
      }
      persist(res.jwtToken, info)
      return info
    },
    [persist],
  )

  const register = useCallback(async (payload) => authApi.registerUser(payload), [])

  const logout = useCallback(() => {
    clear()
    toast.success("You've been logged out.")
  }, [clear])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isAdmin: Boolean(user?.roles?.includes('ADMIN')),
      initializing,
      login,
      register,
      logout,
    }),
    [user, token, initializing, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
