import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import GradientButton from '../components/GradientButton'
import GlassCard from '../components/GlassCard'
import LoadingSpinner from '../components/LoadingSpinner'

const CATEGORIES = [
  { value: 'event', label: 'General Event' },
  { value: 'sports', label: 'Sports' },
  { value: 'bus', label: 'Bus' },
  { value: 'train', label: 'Train' },
]

export default function AdminEventForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'event',
    date: '',
    location: '',
    source: '',
    destination: '',
    price: '',
    available_tickets: '',
    seat_plan: null,
    status: 'active',
  })
  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    if (!id) return
    api.get(`/events/${id}/`)
      .then(({ data }) => {
        setForm({
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'event',
          date: data.date ? data.date.slice(0, 16) : '',
          location: data.location || '',
          source: data.source || '',
          destination: data.destination || '',
          price: data.price ?? '',
          available_tickets: String(data.available_tickets ?? 0),
          seat_plan: data.seat_plan || null,
          status: data.status || 'active',
        })
      })
      .catch(() => setError('Event not found'))
      .finally(() => setLoading(false))
  }, [id])

  const updateSeatPlan = (plan) => setForm((f) => ({ ...f, seat_plan: plan }))

  const addSection = () => {
    const plan = form.seat_plan || { sections: [] }
    const sections = [...(plan.sections || []), { id: `S${(plan.sections?.length || 0) + 1}`, name: '', capacity: 10, price: form.price || 0 }]
    updateSeatPlan({ ...plan, sections })
  }

  const updateSection = (idx, field, value) => {
    const sections = [...(form.seat_plan?.sections || [])]
    sections[idx] = { ...sections[idx], [field]: field === 'capacity' || field === 'price' ? (parseFloat(value) || 0) : value }
    updateSeatPlan({ ...form.seat_plan, sections })
  }

  const removeSection = (idx) => {
    const sections = (form.seat_plan?.sections || []).filter((_, i) => i !== idx)
    updateSeatPlan(sections.length ? { ...form.seat_plan, sections } : null)
  }

  const addSeat = () => {
    const plan = form.seat_plan || { seats: [] }
    const seats = [...(plan.seats || []), { id: String((plan.seats?.length || 0) + 1), label: `Seat ${(plan.seats?.length || 0) + 1}`, price: form.price || 0 }]
    updateSeatPlan({ ...plan, seats })
  }

  const updateSeat = (idx, field, value) => {
    const seats = [...(form.seat_plan?.seats || [])]
    seats[idx] = { ...seats[idx], [field]: field === 'price' ? (parseFloat(value) || 0) : value }
    updateSeatPlan({ ...form.seat_plan, seats })
  }

  const removeSeat = (idx) => {
    const seats = (form.seat_plan?.seats || []).filter((_, i) => i !== idx)
    updateSeatPlan(seats.length ? { ...form.seat_plan, seats } : null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const cat = form.category
    const useSeats = ['sports', 'bus', 'train'].includes(cat) && form.seat_plan
    let available_tickets = parseInt(form.available_tickets, 10) || 0
    if (useSeats) {
      if (form.seat_plan?.sections) {
        available_tickets = (form.seat_plan.sections || []).reduce((s, x) => s + (parseInt(x.capacity, 10) || 0), 0)
      } else if (form.seat_plan?.seats) {
        available_tickets = (form.seat_plan.seats || []).length
      }
    }
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      date: form.date,
      location: form.location,
      source: form.source,
      destination: form.destination,
      price: form.price,
      available_tickets,
      seat_plan: useSeats ? form.seat_plan : null,
      status: form.status,
    }
    try {
      if (imageFile) {
        const fd = new FormData()
        Object.entries(payload).forEach(([k, v]) => {
          if (k === 'image') return
          if (v === null || v === undefined) return
          if (k === 'seat_plan') fd.append(k, JSON.stringify(v))
          else fd.append(k, String(v))
        })
        fd.append('image', imageFile)
        const url = isEdit ? `/admin/events/${id}/` : '/admin/events/'
        const method = isEdit ? 'put' : 'post'
        await api.request({ url, method, data: fd })
      } else {
        if (isEdit) {
          await api.put(`/admin/events/${id}/`, payload)
        } else {
          await api.post('/admin/events/', payload)
        }
      }
      navigate('/admin/events')
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 flex justify-center"><LoadingSpinner /></div>
    )
  }

  const isSports = form.category === 'sports'
  const isBusTrain = form.category === 'bus' || form.category === 'train'
  const useSeatPlan = isSports || isBusTrain

  return (
    <div className="p-8 max-w-2xl animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{isEdit ? 'Edit event' : 'Add event'}</h1>
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, seat_plan: null }))} className="input-field">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field min-h-[100px]" rows={4} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date & time</label>
              <input type="datetime-local" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location</label>
              <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="input-field" />
            </div>
          </div>
          {['bus', 'train'].includes(form.category) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Source (From)</label>
                <input value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} className="input-field" placeholder="e.g. New Delhi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Destination (To)</label>
                <input value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} className="input-field" placeholder="e.g. Mumbai" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Image (for event/sports/bus/train)</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="input-field" />
            {isEdit && !imageFile && <p className="text-slate-500 text-xs mt-1">Leave empty to keep current image.</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Base price ($)</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="input-field" required />
            </div>
            {!useSeatPlan && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Available tickets</label>
                <input type="number" min="0" value={form.available_tickets} onChange={(e) => setForm((f) => ({ ...f, available_tickets: e.target.value }))} className="input-field" required />
              </div>
            )}
          </div>

          {isSports && (
            <div className="space-y-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Stadium sections</label>
                <button type="button" onClick={addSection} className="text-sm text-violet-600 dark:text-violet-400 font-medium">+ Add section</button>
              </div>
              {(form.seat_plan?.sections || []).map((sec, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
                  <input placeholder="ID (e.g. A)" value={sec.id || ''} onChange={(e) => updateSection(i, 'id', e.target.value)} className="input-field" />
                  <input placeholder="Name" value={sec.name || ''} onChange={(e) => updateSection(i, 'name', e.target.value)} className="input-field" />
                  <input type="number" placeholder="Capacity" value={sec.capacity || ''} onChange={(e) => updateSection(i, 'capacity', e.target.value)} className="input-field" min="1" />
                  <input type="number" step="0.01" placeholder="Price" value={sec.price ?? ''} onChange={(e) => updateSection(i, 'price', e.target.value)} className="input-field" />
                  <button type="button" onClick={() => removeSection(i)} className="text-red-500 text-sm">Remove</button>
                </div>
              ))}
            </div>
          )}

          {isBusTrain && (
            <div className="space-y-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Seats</label>
                <button type="button" onClick={addSeat} className="text-sm text-violet-600 dark:text-violet-400 font-medium">+ Add seat</button>
              </div>
              {(form.seat_plan?.seats || []).map((s, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input placeholder="ID" value={s.id || ''} onChange={(e) => updateSeat(i, 'id', e.target.value)} className="input-field w-20" />
                  <input placeholder="Label" value={s.label || ''} onChange={(e) => updateSeat(i, 'label', e.target.value)} className="input-field flex-1" />
                  <input type="number" step="0.01" placeholder="Price" value={s.price ?? ''} onChange={(e) => updateSeat(i, 'price', e.target.value)} className="input-field w-24" />
                  <button type="button" onClick={() => removeSeat(i)} className="text-red-500 text-sm">Remove</button>
                </div>
              ))}
            </div>
          )}

          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="input-field">
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-4">
            <GradientButton type="submit" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}</GradientButton>
            <button type="button" onClick={() => navigate('/admin/events')} className="btn-outline">Back</button>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
