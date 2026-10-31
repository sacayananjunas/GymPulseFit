import { animate, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const compact = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M'
  if (n >= 10_000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return Math.round(n).toLocaleString()
}

export default function AnimatedCounter({ value, duration = 2, suffix = '', format = 'full', className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
  }, [inView, value, duration])

  const text = format === 'compact' ? compact(display) : Math.round(display).toLocaleString()
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {text}
      {suffix}
    </span>
  )
}
