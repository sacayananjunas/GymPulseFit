import { Quote } from 'lucide-react'
import GlassCard from './GlassCard'
import { quoteOfTheDay } from '../data/mock'

export default function QuoteCard({ index = 0, className = '' }) {
  const q = quoteOfTheDay()
  return (
    <GlassCard index={index} className={className}>
      <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-cyan/20 blur-3xl" />
      <div className="flex items-center gap-2">
        <Quote className="h-4 w-4 text-accent" />
        <span className="label">Quote of the day</span>
      </div>
      <p className="mt-3 font-display text-lg font-medium leading-snug sm:text-xl">“{q.text}”</p>
      <p className="mt-3 text-sm text-muted">— {q.author}</p>
    </GlassCard>
  )
}
