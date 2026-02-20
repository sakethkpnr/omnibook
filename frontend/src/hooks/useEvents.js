import { useState, useEffect } from 'react'
import api from '../services/api'

export function useEvents(params = {}) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const query = new URLSearchParams()
    if (params.source) query.append('source', params.source)
    if (params.destination) query.append('destination', params.destination)
    if (params.date) query.append('date', params.date)
    const url = '/events/' + (query.toString() ? '?' + query.toString() : '')
    api.get(url)
      .then(({ data }) => setEvents(data))
      .catch((err) => setError(err.message || 'Failed to load events'))
      .finally(() => setLoading(false))
  }, [params.source, params.destination, params.date])

  const upcoming = events.filter((e) => (e.status || '').toLowerCase() !== 'cancelled')
  return { events: upcoming, loading, error, refetch: () => setLoading(true) }
}
