import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, ArrowRight, Check, Dumbbell, Loader2, Plus, Repeat, Search, SearchX, Timer, X } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { Skeleton, SkeletonCard } from '../components/Skeleton'
import { useToast } from '../components/Toast'
import useApi from '../hooks/useApi'
import { api } from '../lib/api'
import { muscleGroups } from '../data/mock'
import { tint } from '../lib/color'

const difficulty = {
  Beginner: { level: 1, color: '#22E4FF' },
  Intermediate: { level: 2, color: '#FFC83D' },
  Advanced: { level: 3, color: '#FF5C7A' },
}

const groupEmoji = { Chest: '🫁', Back: '🦾', Legs: '🦵', Arms: '💪', Core: '🎯', Cardio: '❤️‍🔥' }

function DifficultyMeter({ value }) {
  const d = difficulty[value]
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold" style={{ color: tint(d.color) }}>
      <span className="flex items-end gap-0.5">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className="w-1.5 rounded-sm"
            style={{ height: 4 + n * 4, background: n <= d.level ? d.color : 'rgb(var(--line) / 0.12)' }}
          />
        ))}
      </span>
      {value}
    </span>
  )
}

function LibrarySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading exercises">
      {Array.from({ length: 6 }, (_, i) => (
        <SkeletonCard key={i}>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-6 w-3/4" />
          <Skeleton className="mt-3 h-3 w-full" />
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((j) => (
              <Skeleton key={j} className="h-14 !rounded-2xl" />
            ))}
          </div>
          <Skeleton className="mt-5 h-10 w-full !rounded-2xl" />
        </SkeletonCard>
      ))}
    </div>
  )
}

export default function Library() {
  const [group, setGroup] = useState('All')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState({})
  const toast = useToast()
  const exercisesReq = useApi('/exercises')
  const today = useApi('/workouts/today')

  // Exercises already in today's open workout.
  const openWorkout = today.data?.workout?.status !== 'completed' ? today.data?.workout : null
  const addedIds = useMemo(() => new Set(openWorkout?.exercises.map((e) => e.exercise_id) ?? []), [openWorkout])

  const list = useMemo(() => {
    const q = query.toLowerCase()
    return (exercisesReq.data?.exercises ?? []).filter(
      (e) =>
        (group === 'All' || e.muscle_group === group) &&
        (e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)),
    )
  }, [exercisesReq.data, group, query])

  const setWorkout = (workout) => today.setData((d) => ({ ...d, workout }))

  const toggle = async (e) => {
    if (busy[e.id]) return
    const isAdded = addedIds.has(e.id)
    const previous = today.data?.workout ?? null
    // Optimistic update so the button responds instantly.
    setWorkout(
      isAdded
        ? { ...openWorkout, exercises: openWorkout.exercises.filter((x) => x.exercise_id !== e.id) }
        : { ...(openWorkout ?? { status: 'planned' }), exercises: [...(openWorkout?.exercises ?? []), { exercise_id: e.id }] },
    )
    setBusy((b) => ({ ...b, [e.id]: true }))
    try {
      const res = isAdded
        ? await api(`/workouts/today?exercise_id=${e.id}`, { method: 'DELETE' })
        : await api('/workouts/today', { method: 'POST', body: { exercise_id: e.id } })
      setWorkout(res.workout)
      toast(
        isAdded
          ? { type: 'info', title: "Removed from today's workout", message: e.name }
          : { title: "Added to today's workout 💪", message: `${e.name} · ${e.sets} × ${e.reps}` },
      )
    } catch (err) {
      setWorkout(previous)
      toast({ type: 'error', title: isAdded ? "Couldn't remove that" : "Couldn't add that", message: err.message })
    } finally {
      setBusy((b) => ({ ...b, [e.id]: false }))
    }
  }

  const count = addedIds.size

  return (
    <div>
      <PageHeader
        eyebrow="Workout library"
        title="Find your next move"
        subtitle={
          exercisesReq.data
            ? `${exercisesReq.data.exercises.length} exercises, from your first push-up to your heaviest pull.`
            : 'Loading exercises…'
        }
        action={
          count > 0 && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <Link to="/workout" className="btn-primary !px-4 !py-2.5 text-sm">
                <Dumbbell className="h-4 w-4" /> {count} in today's workout <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          )
        }
      />

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises…"
          className="glass w-full !rounded-2xl py-3.5 pl-12 pr-12 outline-none transition placeholder:text-muted focus:border-accent/50 focus:shadow-glow-sm"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center text-muted hover:text-ink" aria-label="Clear search">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {muscleGroups.map((g) => {
          const active = g === group
          return (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`relative shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                active ? 'text-[#07090D]' : 'border border-line/10 bg-line/[0.03] text-muted hover:text-ink'
              }`}
            >
              {active && (
                <motion.span layoutId="group-pill" className="absolute inset-0 rounded-full bg-gradient-brand shadow-glow-sm" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <span className="relative">
                {g !== 'All' && <span className="mr-1.5">{groupEmoji[g]}</span>}
                {g}
              </span>
            </button>
          )
        })}
      </div>

      {exercisesReq.loading ? (
        <LibrarySkeleton />
      ) : exercisesReq.error ? (
        <ErrorState error={exercisesReq.error} onRetry={exercisesReq.reload} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No exercises match that"
          message={
            query
              ? `We couldn't find anything for “${query}” in ${group === 'All' ? 'any group' : group}. Try a different word or muscle group.`
              : `No ${group} exercises yet. Try another muscle group.`
          }
          action={
            <button className="btn-ghost" onClick={() => { setQuery(''); setGroup('All') }}>
              Reset filters
            </button>
          }
        />
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((e, i) => {
              const isAdded = addedIds.has(e.id)
              return (
                <motion.article
                  key={e.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: i * 0.03 } }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  whileHover={{ y: -5 }}
                  className={`glass group relative flex flex-col overflow-hidden p-5 transition-shadow hover:shadow-glow ${isAdded ? '!border-accent/40' : ''}`}
                >
                  <div
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: difficulty[e.difficulty].color + '40' }}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="label">{e.muscle_group}</span>
                      <h3 className="mt-1.5 text-lg font-semibold leading-tight">{e.name}</h3>
                    </div>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-line/[0.05] text-xl">{groupEmoji[e.muscle_group]}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{e.description}</p>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Stat icon={Repeat} label="Sets" value={e.sets} />
                    <Stat icon={Activity} label="Reps" value={e.reps} />
                    <Stat icon={Timer} label="Rest" value={`${e.rest_seconds}s`} />
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <DifficultyMeter value={e.difficulty} />
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => toggle(e)}
                      disabled={today.loading}
                      aria-pressed={isAdded}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                        isAdded
                          ? 'bg-gradient-brand text-[#07090D] shadow-glow-sm'
                          : 'border border-line/10 bg-line/[0.04] hover:border-accent/50 hover:text-accent'
                      }`}
                    >
                      {busy[e.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isAdded ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {isAdded ? 'Added' : "Add to today's workout"}
                    </motion.button>
                  </div>
                </motion.article>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-line/[0.04] px-3 py-2.5">
      <p className="flex items-center gap-1 text-[11px] text-muted">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="mt-0.5 truncate font-display text-lg font-bold">{value}</p>
    </div>
  )
}
