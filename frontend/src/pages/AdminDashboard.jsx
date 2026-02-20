import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import GlassCard from '../components/GlassCard'
import LoadingSpinner from '../components/LoadingSpinner'
import GradientButton from '../components/GradientButton'
import { formatDate } from '../utils/formatters'

export default function AdminDashboard({ tab: initialTab = 'overview' }) {
  const [stats, setStats] = useState(null)
  const [events, setEvents] = useState([])
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(initialTab)
  const [paymentFilter, setPaymentFilter] = useState('all')

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  const loadData = async () => {
    try {
      const [s, e, b, u] = await Promise.all([
        api.get('/admin/stats/').then((r) => r.data),
        api.get('/events/').then((r) => r.data),
        api.get('/admin/bookings/').then((r) => r.data).catch(() => []),
        api.get('/admin/users/').then((r) => r.data).catch(() => []),
      ])
      setStats(s)
      setEvents(e)
      setBookings(b)
      setUsers(u)
    } catch {
      setStats({ total_users: 0, total_bookings: 0, total_events: 0, payment_success: 0, payment_pending: 0, total_revenue: '0' })
      setEvents([])
      setBookings([])
      setUsers([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredBookings = paymentFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.payment_status === paymentFilter)

  const handleDeleteEvent = async (e, eventId) => {
    e.preventDefault()
    if (!confirm('Delete this event? This cannot be undone.')) return
    try {
      await api.delete(`/admin/events/${eventId}/`)
      setEvents((prev) => prev.filter((ev) => ev.id !== eventId))
      if (stats) setStats((s) => ({ ...s, total_events: s.total_events - 1 }))
    } catch {
      alert('Could not delete. Use Edit to cancel event instead.')
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          {tab === 'overview' && 'Overview'}
          {tab === 'bookings' && 'All Bookings'}
          {tab === 'payments' && 'Payments'}
          {tab === 'events' && 'Events'}
          {tab === 'users' && 'Users'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          {tab === 'overview' && 'Dashboard stats and overview.'}
          {tab === 'bookings' && 'View all bookings from all users.'}
          {tab === 'payments' && 'Payment summary and revenue.'}
          {tab === 'events' && 'Manage events.'}
          {tab === 'users' && 'All registered users.'}
        </p>

        {tab === 'overview' && stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <GlassCard>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.total_users}</p>
              </GlassCard>
              <GlassCard>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Events</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.total_events}</p>
              </GlassCard>
              <GlassCard>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.total_bookings}</p>
              </GlassCard>
              <GlassCard>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">${stats.total_revenue || '0.00'}</p>
              </GlassCard>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <GlassCard>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Payments Success</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{stats.payment_success || 0}</p>
              </GlassCard>
              <GlassCard>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Payments Pending</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{stats.payment_pending || 0}</p>
              </GlassCard>
            </div>
          </>
        )}

        {tab === 'bookings' && (
          <GlassCard>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h3 className="font-semibold text-slate-900 dark:text-white">All Bookings</h3>
              <div className="flex gap-2">
                {['all', 'SUCCESS', 'PENDING'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setPaymentFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      paymentFilter === f ? 'bg-violet-500 text-white' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    {f === 'all' ? 'All' : f}
                  </button>
                ))}
              </div>
            </div>
            {filteredBookings.length === 0 ? (
              <p className="py-12 text-slate-500 dark:text-slate-400 text-center">No bookings found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Event</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Qty</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => {
                      const amount = b.total_amount != null ? parseFloat(b.total_amount) : (parseFloat(b.event_price) || 0) * (b.quantity || 0)
                      return (
                        <tr key={b.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">#{b.id}</td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-slate-900 dark:text-white">{b.user_username || b.user}</p>
                            <p className="text-xs text-slate-500">{b.user_email}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-slate-900 dark:text-white">{b.event_title}</p>
                            {b.selected_seats?.length > 0 && (
                              <p className="text-xs text-slate-500">Seats: {b.selected_seats.join(', ')}</p>
                            )}
                          </td>
                          <td className="py-3 px-4">{b.quantity}</td>
                          <td className="py-3 px-4 font-medium">${amount.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              b.payment_status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            }`}>
                              {b.payment_status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{formatDate(b.booking_date)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        )}

        {tab === 'payments' && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GlassCard>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Payment Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-xl bg-emerald-500/10">
                  <span className="text-slate-700 dark:text-slate-300">Successful payments</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.payment_success || 0}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-amber-500/10">
                  <span className="text-slate-700 dark:text-slate-300">Pending payments</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{stats.payment_pending || 0}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-violet-500/10">
                  <span className="text-slate-700 dark:text-slate-300">Total revenue</span>
                  <span className="font-bold text-violet-600 dark:text-violet-400">${stats.total_revenue || '0.00'}</span>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Recent Payments</h3>
              {bookings.filter((b) => b.payment_status === 'SUCCESS').slice(0, 5).length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm">No successful payments yet.</p>
              ) : (
                <div className="space-y-3">
                  {bookings.filter((b) => b.payment_status === 'SUCCESS').slice(0, 5).map((b) => {
                    const amount = b.total_amount != null ? parseFloat(b.total_amount) : (parseFloat(b.event_price) || 0) * (b.quantity || 0)
                    return (
                      <div key={b.id} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{b.user_username} - {b.event_title}</p>
                          <p className="text-xs text-slate-500">{formatDate(b.booking_date)}</p>
                        </div>
                        <span className="font-semibold text-emerald-600">${amount.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {tab === 'events' && (
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900 dark:text-white">Events</h3>
              <Link to="/admin/events/new"><GradientButton className="py-2 text-sm">+ Add event</GradientButton></Link>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {events.length === 0 ? (
                <p className="py-12 text-slate-500 dark:text-slate-400 text-center">No events yet.</p>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{ev.title}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">{ev.available_tickets} tickets · {ev.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/admin/events/${ev.id}/edit`} className="btn-outline py-2 text-sm">Edit</Link>
                      <button type="button" onClick={(e) => handleDeleteEvent(e, ev.id)} className="px-4 py-2 rounded-xl border-2 border-red-500/50 text-red-500 hover:bg-red-500/10 text-sm font-medium">
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        )}

        {tab === 'users' && (
          <GlassCard>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-6">All Users</h3>
            {users.length === 0 ? (
              <p className="py-12 text-slate-500 dark:text-slate-400 text-center">No users yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Username</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">#{u.id}</td>
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{u.username}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-violet-500/20 text-violet-600 dark:text-violet-400' : 'bg-slate-200 dark:bg-slate-700'}`}>
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  )
}
