import { useState } from 'react'
import api from '../services/api'
import { formatPrice } from '../utils/formatters'
import GradientButton from '../components/GradientButton'

export default function BookingModal({ event, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const hasSeats = event?.available_seats && Array.isArray(event.available_seats)
  const availableSeats = event?.available_seats || []
  const maxQty = hasSeats ? Math.min(availableSeats.length, 20) : Math.min(event?.available_tickets || 0, 10)

  const toggleSeat = (seat) => {
    if (hasSeats) {
      const id = seat.id
      if (selectedSeats.some((s) => s.id === id)) {
        setSelectedSeats((prev) => prev.filter((s) => s.id !== id))
      } else {
        setSelectedSeats((prev) => [...prev, seat])
      }
    }
  }

  const total = hasSeats
    ? selectedSeats.reduce((s, seat) => s + (seat.price || 0), 0)
    : (parseFloat(formatPrice(event?.price)) || 0) * quantity

  const handleBook = async () => {
    if (hasSeats) {
      if (selectedSeats.length < 1) {
        setError('Please select at least one seat.')
        return
      }
    } else {
      if (quantity < 1 || quantity > maxQty) return
    }
    setError('')
    setLoading(true)
    try {
      const payload = hasSeats
        ? { event_id: event.id, quantity: selectedSeats.length, selected_seats: selectedSeats.map((s) => s.id) }
        : { event_id: event.id, quantity }
      const { data } = await api.post('/book/', payload)
      onSuccess(data.id)
    } catch (err) {
      const msg = err.response?.data?.detail
      const str = typeof msg === 'string' ? msg : (Array.isArray(msg) ? msg[0] : null)
      if (str && /seat.*not available|reserved/i.test(str)) {
        setError('One or more seats were just reserved. Please refresh and select available seats.')
      } else {
        setError(str || 'Booking failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  const canBook = hasSeats ? selectedSeats.length > 0 : quantity >= 1 && quantity <= maxQty

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Book tickets</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{event?.title}</p>
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">{error}</div>
        )}

        {hasSeats ? (
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Select your seats</label>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {availableSeats.map((seat) => {
                const isSelected = selectedSeats.some((s) => s.id === seat.id)
                return (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => toggleSeat(seat)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-violet-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    {seat.label || seat.id} ${seat.price?.toFixed(2)}
                  </button>
                )
              })}
            </div>
            {selectedSeats.length > 0 && (
              <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
                Selected: {selectedSeats.map((s) => s.label || s.id).join(', ')}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Quantity (max {maxQty})</label>
            <input
              type="number"
              min={1}
              max={maxQty}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(maxQty, parseInt(e.target.value, 10) || 1)))}
              className="input-field"
            />
          </div>
        )}

        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Total: <span className="font-semibold text-violet-600 dark:text-violet-400">${total.toFixed(2)}</span>
        </p>
        <div className="mt-8 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 btn-outline py-3">Cancel</button>
          <GradientButton onClick={handleBook} disabled={loading || !canBook || (hasSeats && availableSeats.length === 0)} className="flex-1 py-3">
            {loading ? 'Booking...' : 'Book now'}
          </GradientButton>
        </div>
      </div>
    </div>
  )
}
