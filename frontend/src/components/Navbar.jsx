import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/50 dark:border-slate-700/50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent hover:opacity-90 transition-opacity">
            OmniBook
          </Link>
          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-all">
              Home
            </Link>
            <Link to="/browse" className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-all">
              Browse events
            </Link>
            {user && (
              <>
                {user.role !== 'admin' && (
                  <Link to="/bookings" className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all">
                    My Bookings
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all">
                    Admin
                  </Link>
                )}
              </>
            )}
            <ThemeToggle />
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200/80 dark:bg-slate-700/80 font-medium"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {user.username}
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 py-2 w-40 glass-card rounded-xl z-20 animate-slide-up">
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg">
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50">
                  Login
                </Link>
                <Link to="/admin/login" className="px-4 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50">
                  Admin
                </Link>
                <Link to="/register" className="btn-gradient text-sm py-2">
                  Sign up
                </Link>
              </>
            )}
          </div>
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700 space-y-1 animate-slide-up">
            <Link to="/" className="block px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/browse" className="block px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMenuOpen(false)}>Browse events</Link>
            {user && (
              <>
                {user.role !== 'admin' && <Link to="/bookings" className="block px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMenuOpen(false)}>My Bookings</Link>}
                {user.role === 'admin' && <Link to="/admin" className="block px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMenuOpen(false)}>Admin</Link>}
              </>
            )}
            {user ? (
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Sign out</button>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2 rounded-lg" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/admin/login" className="block px-4 py-2 rounded-lg" onClick={() => setMenuOpen(false)}>Admin</Link>
                <Link to="/register" className="block px-4 py-2 rounded-lg text-violet-600 dark:text-violet-400" onClick={() => setMenuOpen(false)}>Sign up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
