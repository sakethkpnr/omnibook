import { useState } from 'react'
import { useEvents } from '../hooks/useEvents'
import EventCard from '../components/EventCard'
import LoadingSpinner from '../components/LoadingSpinner'

const CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'event', label: 'Events' },
  { value: 'sports', label: 'Sports' },
  { value: 'bus', label: 'Bus' },
  { value: 'train', label: 'Train' },
]

export default function BrowseEvents() {
  const [categoryFilter, setCategoryFilter] = useState('')
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [departureDate, setDepartureDate] = useState('')

  const searchParams = {}
  if (['bus', 'train'].includes(categoryFilter)) {
    if (source) searchParams.source = source
    if (destination) searchParams.destination = destination
    if (departureDate) searchParams.date = departureDate
  }

  const { events, loading, error } = useEvents(searchParams)
  const filteredEvents = categoryFilter
    ? events.filter((e) => (e.category || 'event') === categoryFilter)
    : events

  const isTravel = ['bus', 'train'].includes(categoryFilter)

  return (
    <div className="animate-fade-in py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Upcoming events</h2>
          <p className="text-slate-600 dark:text-slate-400">Browse and book your next experience.</p>
        </div>

        <div className="flex flex-wrap items-end gap-4 mb-10">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field min-w-[160px]"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value || 'all'} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {isTravel && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">From</label>
                <input
                  type="text"
                  placeholder="e.g. New Delhi"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="input-field min-w-[140px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">To</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="input-field min-w-[140px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Departure Date</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setSource('')
                  setDestination('')
                  setDepartureDate('')
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        )}
        {error && (
          <div className="glass-card p-8 text-center">
            <p className="text-red-500">{error}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Ensure the backend is running.</p>
          </div>
        )}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.length === 0 ? (
              <div className="col-span-full glass-card p-12 text-center text-slate-500 dark:text-slate-400">
                No upcoming events. {isTravel && (source || destination || departureDate) ? 'Try different search filters.' : 'Check back later.'}
              </div>
            ) : (
              filteredEvents.map((event) => <EventCard key={event.id} event={event} />)
            )}
          </div>
        )}
      </div>
    </div>
  )
}
