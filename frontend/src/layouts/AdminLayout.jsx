import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { path: '/admin', label: 'Overview' },
    { path: '/admin/bookings', label: 'All Bookings' },
    { path: '/admin/payments', label: 'Payments' },
    { path: '/admin/events', label: 'Events' },
    { path: '/admin/users', label: 'Users' },
  ]

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950">
      <aside className="w-64 flex-shrink-0 glass border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            EventFlow
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, label }) => {
            const isActive = path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path)
            return (
              <Link
                key={path}
                to={path}
                className={`block px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive ? 'bg-violet-500 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <Link to="/" className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg mb-2">
            ← Back to site
          </Link>
          <div className="flex items-center gap-2 px-4 py-2">
            <ThemeToggle />
            <span className="text-sm text-slate-500">{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg text-left"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
