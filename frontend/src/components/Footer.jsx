import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-violet-500 transition-colors">Home</Link>
          <span>© {new Date().getFullYear()} OmniBook</span>
        </div>
      </div>
    </footer>
  )
}
