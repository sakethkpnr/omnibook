import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { formatDate } from '../utils/formatters'
import GlassCard from '../components/GlassCard'
import LoadingSpinner from '../components/LoadingSpinner'
import GradientButton from '../components/GradientButton'

export default function BookingHistory() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)

  const loadBookings = () => {
    setLoading(true)
    api.get('/bookings/user/')
      .then(({ data }) => setBookings(data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const handleCancel = async (b) => {
    if (!confirm('Cancel this booking? Tickets will be released.')) return
    setCancellingId(b.id)
    try {
      await api.post(`/bookings/${b.id}/cancel/`)
      loadBookings()
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || (Array.isArray(err.response?.data?.detail) ? err.response.data.detail[0] : 'Could not cancel booking.')
      alert(typeof msg === 'string' ? msg : 'Could not cancel booking.')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My bookings</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-10">View and manage your ticket bookings.</p>
      {loading && (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      )}
      {!loading && bookings.length === 0 && (
        <GlassCard className="text-center py-16">
          <p className="text-slate-500 dark:text-slate-400 text-lg">You have no bookings yet.</p>
          <Link to="/browse" className="inline-block mt-4 text-violet-500 font-medium hover:underline">Browse events</Link>
        </GlassCard>
      )}
      {!loading && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((b) => (
            <GlassCard key={b.id} className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{b.event_title || `Event #${b.event}`}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                  {formatDate(b.event_date)} · {b.quantity} ticket{b.quantity !== 1 ? 's' : ''}
                  {b.selected_seats?.length > 0 && ` · Seats: ${b.selected_seats.join(', ')}`}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {b.is_cancelled && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-600 dark:text-red-400">
                    Cancelled
                  </span>
                )}
                {!b.is_cancelled && (
                  <>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${b.payment_status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'}`}>
                      {b.payment_status}
                    </span>
                    {b.payment_status !== 'SUCCESS' && (
                      <Link to={`/payment/${b.id}`}><GradientButton className="py-2 text-sm">Pay now</GradientButton></Link>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCancel(b)}
                      disabled={cancellingId === b.id}
                      className="px-3 py-2 rounded-xl border-2 border-red-500/50 text-red-500 hover:bg-red-500/10 disabled:opacity-50 text-sm font-medium"
                    >
                      {cancellingId === b.id ? 'Cancelling…' : 'Cancel ticket'}
                    </button>
                  </>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
