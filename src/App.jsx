import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import LiveWorkout from './pages/LiveWorkout'
import Progress from './pages/Progress'
import Classes from './pages/Classes'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import { Login, Signup } from './pages/AuthPages'

const titles = {
  '/': 'PulseFit — Train smarter. Get stronger.',
  '/login': 'Log in · PulseFit',
  '/signup': 'Sign up · PulseFit',
  '/dashboard': 'Dashboard · PulseFit',
  '/library': 'Workout Library · PulseFit',
  '/workout': 'Live Workout · PulseFit',
  '/progress': 'Progress · PulseFit',
  '/classes': 'Classes · PulseFit',
  '/profile': 'Profile · PulseFit',
}

const guard = (el) => <ProtectedRoute>{el}</ProtectedRoute>

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = titles[pathname] || 'PulseFit'
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={guard(<Dashboard />)} />
        <Route path="/library" element={guard(<Library />)} />
        <Route path="/workout" element={guard(<LiveWorkout />)} />
        <Route path="/profile" element={guard(<Profile />)} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
