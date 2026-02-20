import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GradientButton from '../components/GradientButton'
import GlassCard from '../components/GlassCard'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <GlassCard className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-6">Sign in to book events.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="Your username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>
          <GradientButton type="submit" disabled={loading} className="w-full py-3">
            {loading ? 'Signing in...' : 'Sign in'}
          </GradientButton>
        </form>
        <p className="mt-6 text-center text-slate-500 dark:text-slate-400 text-sm">
          Don't have an account? <Link to="/register" className="text-violet-500 font-medium hover:underline">Sign up</Link>
        </p>
      </GlassCard>
    </div>
  )
}
