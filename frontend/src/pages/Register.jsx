import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GradientButton from '../components/GradientButton'
import GlassCard from '../components/GlassCard'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(username, email, password)
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      const msg = typeof data === 'string' ? data : (data && Object.values(data).flat().join(' ')) || 'Registration failed.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <GlassCard className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create account</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-6">Join EventFlow to book events.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field" placeholder="Username" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required minLength={6} />
          </div>
          <GradientButton type="submit" disabled={loading} className="w-full py-3">
            {loading ? 'Creating account...' : 'Sign up'}
          </GradientButton>
        </form>
        <p className="mt-6 text-center text-slate-500 dark:text-slate-400 text-sm">
          Already have an account? <Link to="/login" className="text-violet-500 font-medium hover:underline">Sign in</Link>
        </p>
      </GlassCard>
    </div>
  )
}
