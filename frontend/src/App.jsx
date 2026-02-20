import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import BrowseEvents from './pages/BrowseEvents'
import Login from './pages/Login'
import Register from './pages/Register'
import EventDetail from './pages/EventDetail'
import Payment from './pages/Payment'
import BookingHistory from './pages/BookingHistory'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import AdminEventForm from './pages/AdminEventForm'
import AdminLogin from './pages/AdminLogin'

function ProtectedRoute({ children, adminOnly = false, userOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    )
  }
  if (!user) return <Navigate to={adminOnly ? '/admin/login' : '/login'} replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  if (userOnly && user.role === 'admin') return <Navigate to="/admin" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="browse" element={<BrowseEvents />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="payment/:bookingId" element={<ProtectedRoute userOnly><Payment /></ProtectedRoute>} />
        <Route path="bookings" element={<ProtectedRoute userOnly><BookingHistory /></ProtectedRoute>} />
        <Route path="admin" element={<Outlet />}>
          <Route path="login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard tab="overview" />} />
            <Route path="bookings" element={<AdminDashboard tab="bookings" />} />
            <Route path="payments" element={<AdminDashboard tab="payments" />} />
            <Route path="events" element={<AdminDashboard tab="events" />} />
            <Route path="events/new" element={<AdminEventForm />} />
            <Route path="events/:id/edit" element={<AdminEventForm />} />
            <Route path="users" element={<AdminDashboard tab="users" />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
