import { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(() => {})

const styles = {
  success: { icon: CheckCircle2, color: '#C6FF3D' },
  error: { icon: AlertTriangle, color: '#FF6B6B' },
  info: { icon: Info, color: '#22E4FF' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const toast = useCallback(
    ({ title, message, type = 'success', duration = 3500 }) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((t) => [...t.slice(-2), { id, title, message, type }])
      setTimeout(() => dismiss(id), duration)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 md:bottom-6 md:right-6 md:top-auto md:items-end">
        <AnimatePresence>
          {toasts.map((t) => {
            const { icon: Icon, color } = styles[t.type]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="glass pointer-events-auto flex w-full max-w-sm items-start gap-3 !rounded-2xl p-4"
                style={{ boxShadow: `0 10px 40px -10px ${color}66` }}
                role="status"
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} />
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold">{t.title}</p>
                  {t.message && <p className="mt-0.5 text-sm text-muted">{t.message}</p>}
                </div>
                <button onClick={() => dismiss(t.id)} className="text-muted hover:text-ink" aria-label="Dismiss">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
