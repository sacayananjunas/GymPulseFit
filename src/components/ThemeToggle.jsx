import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useApp()
  const dark = theme === 'dark'
  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
      className={`relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-line/10 bg-line/[0.04] transition hover:border-accent/50 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 16, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -16, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.25 }}
        >
          {dark ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px] text-amber-500" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
