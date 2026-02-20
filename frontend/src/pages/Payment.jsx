import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import GradientButton from '../components/GradientButton'
import GlassCard from '../components/GlassCard'

export default function Payment() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handlePay = async () => {
    if (!bookingId) return
    setError('')
    setLoading(true)
    try {
      await api.post(`/bookings/${bookingId}/complete_payment/`)
      setSuccess(true)
    } catch {
      setError('Payment could not be completed.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
        <GlassCard>
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Payment successful</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8">Your booking is confirmed.</p>
          <GradientButton onClick={() => navigate('/bookings')} className="w-full py-3">View my bookings</GradientButton>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
      <GlassCard>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Complete payment</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-6">Simulated payment. Click to confirm.</p>
        {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">{error}</div>}
        <GradientButton onClick={handlePay} disabled={loading} className="w-full py-4">{loading ? 'Processing...' : 'Pay now'}</GradientButton>
        <button type="button" onClick={() => navigate('/bookings')} className="w-full mt-3 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          Cancel
        </button>
      </GlassCard>
    </div>
  )
}
