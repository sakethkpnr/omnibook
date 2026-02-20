import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) setUser(JSON.parse(stored))
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (username, password) => {
    const { data } = await api.post('/login/', { username, password })
    localStorage.setItem('token', data.access)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const register = async (username, email, password) => {
    const { data } = await api.post('/register/', { username, email, password })
    localStorage.setItem('token', data.access)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
