import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GradientButton from '../components/GradientButton'

export default function Home() {
  const { user } = useAuth()
  const displayName = user?.username || 'Guest'

  return (
    <div className="animate-fade-in">
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10 pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome, {displayName}!
            {user?.role !== 'admin' && (
              <>
                <br />
                <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">All users welcome.</span>
              </>
            )}
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Discover concerts, conferences, sports, transport, and more. Reserve your tickets in seconds.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link to="/browse" className="btn-gradient inline-flex items-center gap-2">
              Browse events
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </Link>
            {!user && (
              <Link to="/register" className="btn-outline inline-flex items-center gap-2">
                Get started
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
