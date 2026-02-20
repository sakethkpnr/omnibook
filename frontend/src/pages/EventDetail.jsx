import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { formatDateTime, formatPrice } from '../utils/formatters'
import GradientButton from '../components/GradientButton'
import LoadingSpinner from '../components/LoadingSpinner'
import BookingModal from '../components/BookingModal'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!id) return
    api.get(`/events/${id}/`)
      .then(({ data }) => setEvent(data))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleBookingSuccess = (bookingId) => {
    setShowModal(false)
    navigate(`/payment/${bookingId}`)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
        <LoadingSpinner />
      </div>
    )
  }
  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-500">
        Event not found. <button onClick={() => navigate('/')} className="text-violet-500 hover:underline">Back home</button>
      </div>
    )
  }

  const isCancelled = (event.status || '').toLowerCase() === 'cancelled'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="glass-card overflow-hidden">
        <div className="h-64 sm:h-80 relative overflow-hidden">
          {event.image ? (
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-500/40 via-fuchsia-500/30 to-pink-500/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{event.title}</h1>
            <p className="text-slate-200 mt-2">{formatDateTime(event.date)}</p>
            <p className="text-slate-300 text-sm mt-1">
              {['bus', 'train'].includes(event.category || '') && event.source && event.destination
                ? `${event.source} → ${event.destination}`
                : (event.location || 'Venue TBA')}
            </p>
            {isCancelled && (
              <span className="inline-block mt-3 px-3 py-1 rounded-lg bg-red-500/90 text-white text-sm font-semibold">Cancelled</span>
            )}
          </div>
        </div>
        <div className="p-8">
          {event.description && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">About</h3>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-8 p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-sm block">Price</span>
              <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">${formatPrice(event.price)} <span className="text-slate-500 text-base font-normal">/ ticket</span></p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-sm block">Available</span>
              <p className="text-xl font-semibold">
                {event.available_seats?.length != null
                  ? `${event.available_seats.length} seats`
                  : `${event.available_tickets} tickets`}
              </p>
            </div>
            {!isCancelled && ((event.available_seats?.length > 0) || (event.available_tickets > 0)) && user?.role !== 'admin' && (
              <GradientButton onClick={() => (user ? setShowModal(true) : navigate('/login'))}>
                Book tickets
              </GradientButton>
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <BookingModal event={event} onClose={() => setShowModal(false)} onSuccess={handleBookingSuccess} />
      )}
    </div>
  )
}
