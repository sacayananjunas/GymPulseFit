import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bike, CalendarX, Check, Clock, Flower2, Swords, User, Users, Zap } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { useToast } from '../components/Toast'
import { useApp } from '../context/AppContext'
import { classes, classTypes, weekDays } from '../data/mock'
import { tint } from '../lib/color'

const typeIcon = { Yoga: Flower2, HIIT: Zap, Spin: Bike, Boxing: Swords }
const types = ['All', ...Object.keys(classTypes)]

export default function Classes() {
  const todayName = weekDays[(new Date().getDay() + 6) % 7]
  const [day, setDay] = useState(todayName)
  const [type, setType] = useState('All')
  const { bookings, book, cancel } = useApp()
  const toast = useToast()

  const list = useMemo(() => classes.filter((c) => c.day === day && (type === 'All' || c.type === type)), [day, type])
  const countByDay = useMemo(() => Object.fromEntries(weekDays.map((d) => [d, classes.filter((c) => c.day === d).length])), [])

  const onBook = (c) => {
    if (bookings.includes(c.id)) {
      cancel(c.id)
      toast({ type: 'info', title: 'Booking cancelled', message: `Your spot in ${c.title} has been released.` })
      return
    }
    if (c.spots === 0) {
      toast({ type: 'error', title: 'This class is full 😅', message: 'We added you to the waitlist and will ping you if a spot opens.' })
      return
    }
    book(c.id)
    toast({ title: "You're booked! 🎉", message: `${c.title} · ${c.day} at ${c.time} with ${c.coach}` })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Class booking"
        title="This week at PulseFit"
        subtitle="Grab your spot in Yoga, HIIT, Spin and Boxing."
        action={
          bookings.length > 0 && (
            <span className="chip !border-accent/30 !text-accent">
              <Check className="h-3.5 w-3.5" /> {bookings.length} booked
            </span>
          )
        }
      />

      {/* Day selector */}
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-7 sm:px-0">
        {weekDays.map((d) => {
          const active = d === day
          return (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`relative flex min-w-[4.25rem] shrink-0 flex-col items-center rounded-2xl px-3 py-3 transition ${
                active ? 'text-[#07090D]' : 'glass !rounded-2xl !shadow-none hover:border-accent/40'
              }`}
            >
              {active && <motion.span layoutId="day-pill" className="absolute inset-0 rounded-2xl bg-gradient-brand shadow-glow" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className={`relative text-xs font-semibold ${active ? '' : 'text-muted'}`}>{d === todayName ? 'Today' : d}</span>
              <span className="relative font-display text-xl font-bold">{countByDay[d]}</span>
              <span className={`relative text-[10px] ${active ? 'opacity-70' : 'text-muted'}`}>classes</span>
            </button>
          )
        })}
      </div>

      {/* Type filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {types.map((tp) => {
          const Icon = typeIcon[tp]
          const active = tp === type
          const color = classTypes[tp]?.color
          return (
            <button
              key={tp}
              onClick={() => setType(tp)}
              className={`chip !px-4 !py-2 text-sm transition ${active ? '!border-accent/50 !bg-accent/10 !text-ink' : 'text-muted hover:text-ink'}`}
            >
              {Icon && <Icon className="h-4 w-4" style={{ color: color && tint(color) }} />}
              {tp}
            </button>
          )
        })}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title={`No ${type === 'All' ? '' : type + ' '}classes on ${day}`}
          message="Rest days count too! Try another day or class type, or take an open-gym session."
          action={
            <button className="btn-ghost" onClick={() => setType('All')}>
              Show all classes
            </button>
          }
        />
      ) : (
        <motion.div layout className="grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {list.map((c, i) => {
              const meta = classTypes[c.type]
              const Icon = typeIcon[c.type]
              const booked = bookings.includes(c.id)
              const spots = booked ? c.spots - 1 : c.spots
              const full = c.spots === 0
              const fill = 1 - Math.max(spots, 0) / c.capacity
              return (
                <motion.article
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -4 }}
                  className={`glass relative overflow-hidden p-5 transition-shadow hover:shadow-glow ${booked ? '!border-accent/40' : ''}`}
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl" style={{ background: meta.color + '30' }} />
                  <div className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="grid h-14 w-14 place-items-center rounded-2xl" style={{ background: meta.color + '1f', color: tint(meta.color) }}>
                        <Icon className="h-7 w-7" />
                      </span>
                      <span className="mt-2 font-display text-lg font-bold">{c.time}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tint(meta.color) }}>
                        {c.type}
                      </span>
                      <h3 className="text-xl font-semibold leading-tight">{c.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                        <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {c.coach}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {c.duration} min</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-5">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted">
                        <Users className="h-3.5 w-3.5" /> {c.capacity - Math.max(spots, 0)}/{c.capacity} joined
                      </span>
                      <span className={`font-semibold ${full ? 'text-red-600 dark:text-red-400' : spots <= 3 ? 'text-orange-600 dark:text-orange-400' : 'text-accent'}`}>
                        {full ? 'Full' : spots <= 0 ? 'You got the last spot!' : `${spots} spot${spots === 1 ? '' : 's'} left`}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-line/[0.08]">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: full ? '#F87171' : meta.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${fill * 100}%` }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onBook(c)}
                    className={`relative mt-5 w-full ${booked ? 'btn-ghost !border-accent/40 !text-accent' : full ? 'btn-ghost' : 'btn-primary'}`}
                  >
                    {booked ? (
                      <>
                        <Check className="h-4 w-4" /> Booked · tap to cancel
                      </>
                    ) : full ? (
                      'Join waitlist'
                    ) : (
                      'Book spot'
                    )}
                  </motion.button>
                </motion.article>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
