import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const { user } = await api('/auth/me')
      setUser(user)
      setError(null)
    } catch (err) {
      setUser(null)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (email, password) => {
    const { user } = await api('/auth/login', { method: 'POST', body: { email, password } })
    setUser(user)
    setError(null)
    return user
  }, [])

  const signup = useCallback(async (fields) => {
    const { user } = await api('/auth/signup', { method: 'POST', body: fields })
    setUser(user)
    setError(null)
    return user
  }, [])

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' })
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, error, refresh, login, signup, logout }), [user, loading, error, refresh, login, signup, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
