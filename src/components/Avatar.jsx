import { useState } from 'react'

export default function Avatar({ src, name, className = 'h-10 w-10' }) {
  const [failed, setFailed] = useState(false)
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
  return (
    <span className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-brand p-[2px] ${className}`}>
      {src && !failed ? (
        <img src={src} alt={name} onError={() => setFailed(true)} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="grid h-full w-full place-items-center rounded-full bg-bg font-display font-bold text-accent">{initials}</span>
      )}
    </span>
  )
}
