import { Link } from 'react-router-dom'
import { formatDate, formatPrice } from '../utils/formatters'

const CAT_LABELS = { event: 'Event', sports: 'Sports', bus: 'Bus', train: 'Train' }

export default function EventCard({ event }) {
  const isCancelled = (event.status || '').toLowerCase() === 'cancelled'
  const available = event.available_seats?.length != null ? event.available_seats.length : (event.available_tickets ?? 0)
  const cat = event.category || 'event'
  return (
    <Link
      to={`/events/${event.id}`}
      className={`block glass-card overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-violet-500/10 ${isCancelled ? 'opacity-60 pointer-events-none' : ''}`}
    >
      <div className="h-40 relative overflow-hidden">
        {event.image ? (
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-500/30 via-fuchsia-500/30 to-pink-500/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-3 left-4">
          <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-xs font-medium">{CAT_LABELS[cat] || cat}</span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/90">{formatDate(event.date)}</span>
          <h3 className="text-lg font-bold text-white mt-1 line-clamp-2">{event.title}</h3>
        </div>
        {isCancelled && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-red-500/90 text-white text-xs font-semibold">Cancelled</span>
        )}
      </div>
      <div className="p-5">
        <p className="text-slate-500 dark:text-slate-400 text-sm truncate">
          {['bus', 'train'].includes(event.category || '')
            ? (event.source && event.destination ? `${event.source} → ${event.destination}` : event.location || 'Route TBA')
            : (event.location || 'Venue TBA')}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-violet-600 dark:text-violet-400">${formatPrice(event.price)}</span>
          <span className="text-slate-500 dark:text-slate-400 text-sm">{available} left</span>
        </div>
      </div>
    </Link>
  )
}
