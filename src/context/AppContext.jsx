import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AppContext = createContext(null)

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable — state stays in memory */
  }
}

// UI preferences and the (still sample-data) class bookings. Workout data lives in the database.
export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('pulsefit-theme') || 'dark'
    } catch {
      return 'dark'
    }
  })
  const [bookings, setBookings] = useState(() => read('pulsefit-bookings', []))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#07090D' : '#F4F6F1')
    try {
      localStorage.setItem('pulsefit-theme', theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  useEffect(() => write('pulsefit-bookings', bookings), [bookings])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  const book = useCallback((id) => setBookings((b) => (b.includes(id) ? b : [...b, id])), [])
  const cancel = useCallback((id) => setBookings((b) => b.filter((x) => x !== id)), [])

  const value = useMemo(() => ({ theme, toggleTheme, bookings, book, cancel }), [theme, toggleTheme, bookings, book, cancel])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
