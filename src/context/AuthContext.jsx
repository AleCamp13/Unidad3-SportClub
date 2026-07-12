import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../services/apiClient'
import * as authService from '../services/authService'
import { AuthContext, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './authContextValue'

function readStoredUser(token) {
  if (!token) {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }

  try {
    return JSON.parse(localStorage.getItem(USER_STORAGE_KEY))
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

function persistSession(token, user) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

function clearStoredSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

export function AuthProvider({ children }) {
  const [initialToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY))
  const [token, setToken] = useState(initialToken)
  const [user, setUser] = useState(() => readStoredUser(initialToken))
  const [isRestoring, setIsRestoring] = useState(Boolean(initialToken))

  const clearSession = useCallback(({ storage = true } = {}) => {
    setToken(null)
    setUser(null)
    if (storage) clearStoredSession()
  }, [])

  useEffect(() => {
    if (!initialToken) {
      setIsRestoring(false)
      return undefined
    }

    let active = true
    authService.getCurrentUser(initialToken)
      .then((currentUser) => {
        if (!active) return
        setUser(currentUser)
        persistSession(initialToken, currentUser)
      })
      .catch((error) => {
        if (!active) return
        clearSession({ storage: error instanceof ApiError && error.status === 401 })
      })
      .finally(() => {
        if (active) setIsRestoring(false)
      })

    return () => { active = false }
  }, [clearSession, initialToken])

  const login = useCallback(async (credentials) => {
    const session = await authService.login(credentials)
    persistSession(session.token, session.user)
    setToken(session.token)
    setUser(session.user)
    return session.user
  }, [])

  const register = useCallback((payload) => authService.register(payload), [])

  const refreshUser = useCallback(async () => {
    if (!token) return null
    const currentUser = await authService.getCurrentUser(token)
    setUser(currentUser)
    persistSession(token, currentUser)
    return currentUser
  }, [token])

  const logout = useCallback(() => clearSession(), [clearSession])

  const value = useMemo(() => ({
    user,
    token,
    isRestoring,
    login,
    register,
    refreshUser,
    logout,
  }), [user, token, isRestoring, login, register, refreshUser, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
