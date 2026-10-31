import { useId } from 'react'
import { Link } from 'react-router-dom'

const PULSE_PATH = 'M4 34h14l5-14 9 26 7-18 4 6h17'

export function PulseMark({ className = 'h-9 w-9' }) {
  // Unique per instance: a gradient defined inside a hidden copy (e.g. the desktop sidebar on phones) won't render.
  const gradId = `pf-grad-${useId().replace(/:/g, '')}`
  return (
    <span className={`relative grid place-items-center rounded-xl bg-[#0B0F14] ring-1 ring-white/10 ${className}`}>
      <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]" aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#C6FF3D" />
            <stop offset="1" stopColor="#22E4FF" />
          </linearGradient>
        </defs>
        <path d={PULSE_PATH} fill="none" stroke={`url(#${gradId})`} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d={PULSE_PATH}
          fill="none"
          stroke="#fff"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="22 178"
          className="animate-pulseLine opacity-80"
        />
      </svg>
      <span className="absolute inset-0 rounded-xl shadow-[0_0_24px_-6px_#C6FF3D]" />
    </span>
  )
}

export default function Logo({ to = '/', size = 'md' }) {
  const text = size === 'lg' ? 'text-3xl' : 'text-2xl'
  return (
    <Link to={to} className="group inline-flex items-center gap-2.5" aria-label="PulseFit home">
      <PulseMark className={size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'} />
      <span className={`font-display font-bold italic tracking-tighter ${text}`}>
        <span className="text-gradient">Pulse</span>
        <span className="text-ink">Fit</span>
      </span>
    </Link>
  )
}
