import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { Check, ChevronRight, Library, Loader2, Minus, Pause, Play, Plus, PartyPopper, SkipForward, Timer, Trophy } from 'lucide-react'
import ProgressRing from '../components/ProgressRing'
import GlassCard from '../components/GlassCard'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { Skeleton, SkeletonCard } from '../components/Skeleton'
import { useToast } from '../components/Toast'
import useApi from '../hooks/useApi'
import { api } from '../lib/api'
import { estimateKcal, workoutGroups } from '../lib/workout'

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

const fireConfetti = () => {
  const colors = ['#C6FF3D', '#22E4FF', '#ffffff', '#B987FF']
  const end = Date.now() + 1800
  ;(function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors })
    confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
  confetti({ particleCount: 160, spread: 100, startVelocity: 45, origin: { y: 0.55 }, colors, scalar: 1.1 })
}

function LiveSkeleton() {
  return (
    <div role="status" aria-label="Loading workout">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-3 h-10 w-64" />
      <Skeleton className="mb-6 mt-6 h-2 w-full !rounded-full" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <SkeletonCard className="flex h-[480px] items-center justify-center">
          <Skeleton className="h-60 w-60 !rounded-full" />
        </SkeletonCard>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i}>
              <Skeleton className="h-5 w-1/2" />
              <div className="mt-4 flex gap-2">
                {[0, 1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-12 flex-1" />
                ))}
              </div>
            </SkeletonCard>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LiveWorkout() {
  const { data, error, loading, reload, setData } = useApi('/workouts/today')

  if (loading) return <LiveSkeleton />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const workout = data.workout
  if (!workout || workout.exercises.length === 0) {
    return (
      <EmptyState
        icon={Library}
        title="No workout yet today"
        message="Pick one from the Library! Add a few exercises and come back here to start your session."
        action={
          <Link to="/library" className="btn-primary">
            <Library className="h-4 w-4" /> Open the Library
          </Link>
        }
      />
    )
  }
  if (workout.status === 'completed') {
    return (
      <EmptyState
        icon={PartyPopper}
        title="Today's workout is done! 🎉"
        message={`You finished ${workout.name} in ${workout.duration_minutes} min. Recover well, or plan another session.`}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/dashboard" className="btn-primary">Back to dashboard</Link>
            <Link to="/library" className="btn-ghost">Plan another</Link>
          </div>
        }
      />
    )
  }

  return <Session key={workout.id} workout={workout} updateWorkout={(fn) => setData((d) => ({ ...d, workout: fn(d.workout) }))} />
}

function Session({ workout, updateWorkout }) {
  const toast = useToast()
  const exercises = workout.exercises
  const firstRest = exercises[0]?.rest_seconds ?? 90

  const [restTotal, setRestTotal] = useState(firstRest)
  const [remaining, setRemaining] = useState(firstRest)
  const [running, setRunning] = useState(false)
  const [startedAt, setStartedAt] = useState(workout.started_at ? new Date(workout.started_at) : null)
  const [now, setNow] = useState(() => Date.now())
  const [finishing, setFinishing] = useState(false)
  const [result, setResult] = useState(null)
  const pending = useRef(new Set())
  const autoFinished = useRef(false)

  const sets = exercises.map((e) => e.set_list)
  const totalSets = sets.flat().length
  const doneSets = sets.flat().filter((s) => s.completed).length
  const currentEx = sets.findIndex((row) => row.some((s) => !s.completed))
  const elapsed = startedAt ? Math.max(0, Math.floor((now - startedAt.getTime()) / 1000)) : 0

  // Session clock
  useEffect(() => {
    if (result) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [result])

  // Rest countdown
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    if (!running || remaining > 0) return
    setRunning(false)
    toast({ type: 'info', title: 'Rest over — next set! ⚡', message: 'Get set up and go.' })
    try {
      navigator.vibrate?.([200, 100, 200])
    } catch {
      /* not supported */
    }
  }, [running, remaining, toast])

  const startRest = useCallback((seconds) => {
    setRestTotal(seconds)
    setRemaining(seconds)
    setRunning(true)
  }, [])

  const patchSet = (setId, completed) =>
    updateWorkout((w) => ({
      ...w,
      exercises: w.exercises.map((e) => ({
        ...e,
        set_list: e.set_list.map((s) => (s.id === setId ? { ...s, completed } : s)),
      })),
    }))

  const toggleSet = (ei, si) => {
    if (finishing || result) return
    const set = sets[ei][si]
    const completed = !set.completed
    patchSet(set.id, completed) // optimistic
    if (completed) startRest(exercises[ei].rest_seconds)

    const req = api(`/sets/${set.id}`, { method: 'PATCH', body: { completed } })
      .then(({ set: saved }) => {
        if (saved.started_at && !startedAt) setStartedAt(new Date(saved.started_at))
      })
      .catch((err) => {
        patchSet(set.id, !completed) // roll back
        toast({ type: 'error', title: "That set didn't save", message: err.message })
      })
      .finally(() => pending.current.delete(req))
    pending.current.add(req)
  }

  const finish = useCallback(async () => {
    setFinishing(true)
    setRunning(false)
    await Promise.allSettled([...pending.current])
    try {
      const res = await api(`/workouts/${workout.id}`, { method: 'PATCH', body: { action: 'complete' } })
      setResult(res)
      fireConfetti()
      toast({ title: 'Workout saved 🏆', message: `${res.workout.duration_minutes} min logged. Your dashboard is updated.` })
    } catch (err) {
      toast({ type: 'error', title: "Couldn't finish your workout", message: err.message })
      setFinishing(false)
    }
  }, [workout.id, toast])

  // Auto-finish once when every set is ticked (re-armed if a set gets unticked).
  useEffect(() => {
    if (doneSets < totalSets) autoFinished.current = false
    else if (totalSets > 0 && !autoFinished.current && !finishing && !result) {
      autoFinished.current = true
      finish()
    }
  }, [doneSets, totalSets, finishing, result, finish])

  const finishEarly = () => {
    if (doneSets === 0) {
      toast({ type: 'error', title: 'Not so fast!', message: 'Complete at least one set before finishing your workout.' })
      return
    }
    finish()
  }

  const ringColor = remaining <= 10 && running ? '#FF5C7A' : '#C6FF3D'
  const presets = [...new Set([30, 60, 90, 120, exercises[Math.max(currentEx, 0)]?.rest_seconds ?? 90])].sort((a, b) => a - b)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label mb-2 flex items-center gap-2 !text-accent">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Live workout
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">{workout.name}</h1>
          <p className="mt-1 text-muted">{workoutGroups(exercises).join(' · ')}</p>
        </div>
        <div className="flex gap-2">
          <span className="chip !py-2 font-display text-sm tabular-nums" title={startedAt ? 'Time since your first set' : 'Starts with your first set'}>
            <Timer className="h-4 w-4 text-accent" /> {startedAt ? fmt(elapsed) : 'Not started'}
          </span>
          <span className="chip !py-2 font-display text-sm tabular-nums">
            {doneSets}/{totalSets} sets
          </span>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-line/[0.08]">
        <motion.div
          className="h-full rounded-full bg-gradient-brand shadow-glow-sm"
          animate={{ width: `${(doneSets / totalSets) * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        {/* Timer */}
        <GlassCard hover={false} className="flex flex-col items-center lg:sticky lg:top-10 lg:self-start">
          <span className="label">Rest timer</span>
          <div className="relative my-6">
            <motion.div
              className="absolute inset-6 rounded-full blur-3xl"
              animate={{ opacity: running ? [0.25, 0.5, 0.25] : 0.15 }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ background: ringColor }}
            />
            <ProgressRing value={remaining} max={restTotal} size={260} stroke={16} color={ringColor} color2={running && remaining <= 10 ? '#FF9F43' : '#22E4FF'} duration={0.9}>
              <div>
                <motion.p
                  key={remaining}
                  initial={{ scale: 1.08, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-display text-6xl font-bold tabular-nums"
                >
                  {fmt(remaining)}
                </motion.p>
                <p className="mt-1 text-sm text-muted">{running ? 'Breathe. Recover.' : remaining === 0 ? 'Go time!' : 'Ready'}</p>
              </div>
            </ProgressRing>
          </div>

          <div className="flex items-center gap-3">
            <button className="btn-ghost !h-12 !w-12 !p-0" onClick={() => setRemaining((r) => Math.max(0, r - 15))} aria-label="Minus 15 seconds">
              <Minus className="h-5 w-5" />
            </button>
            <button
              className="btn-primary !h-16 !w-16 !rounded-full !p-0"
              onClick={() => (remaining === 0 ? startRest(restTotal) : setRunning((r) => !r))}
              aria-label={running ? 'Pause' : 'Start'}
            >
              {running ? <Pause className="h-7 w-7 fill-current" /> : <Play className="ml-1 h-7 w-7 fill-current" />}
            </button>
            <button
              className="btn-ghost !h-12 !w-12 !p-0"
              onClick={() => {
                setRemaining((r) => r + 15)
                setRestTotal((t) => Math.max(t, remaining + 15))
              }}
              aria-label="Plus 15 seconds"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {presets.map((s) => (
              <button
                key={s}
                onClick={() => startRest(s)}
                className={`chip !py-2.5 transition hover:border-accent/50 ${restTotal === s ? '!border-accent/40 !text-accent' : ''}`}
              >
                {s}s
              </button>
            ))}
            <button onClick={() => { setRunning(false); setRemaining(0) }} className="chip !py-2.5 transition hover:border-accent/50">
              <SkipForward className="h-3 w-3" /> Skip
            </button>
          </div>
        </GlassCard>

        {/* Exercise list */}
        <div className="space-y-3">
          {exercises.map((e, ei) => {
            const exDone = sets[ei].length > 0 && sets[ei].every((s) => s.completed)
            const isCurrent = ei === currentEx
            return (
              <GlassCard
                key={e.workout_exercise_id}
                index={ei}
                hover={false}
                className={`!p-4 transition sm:!p-5 ${isCurrent ? '!border-accent/40 shadow-glow' : ''} ${exDone ? 'opacity-70' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display font-bold ${
                      exDone ? 'bg-gradient-brand text-[#07090D]' : isCurrent ? 'bg-accent/15 text-accent' : 'bg-line/[0.06] text-muted'
                    }`}
                  >
                    {exDone ? <Check className="h-5 w-5" /> : ei + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className={`truncate font-semibold ${exDone ? 'line-through decoration-accent/60' : ''}`}>{e.name}</h3>
                    <p className="text-xs text-muted">
                      {e.sets} sets × {e.reps} reps · rest {e.rest_seconds}s
                    </p>
                  </div>
                  {isCurrent && <span className="chip !border-accent/30 !text-accent">Now</span>}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {sets[ei].map((s, si) => (
                    <motion.button
                      key={s.id}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => toggleSet(ei, si)}
                      disabled={finishing}
                      className={`relative flex h-12 min-w-[4.5rem] flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-xl border text-sm font-semibold transition sm:flex-none ${
                        s.completed ? 'border-transparent text-[#07090D]' : 'border-line/10 bg-line/[0.03] text-muted hover:border-accent/40 hover:text-ink'
                      }`}
                      aria-pressed={s.completed}
                      aria-label={`${e.name} set ${s.set_number}`}
                    >
                      <AnimatePresence>
                        {s.completed && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute inset-0 bg-gradient-brand"
                          />
                        )}
                      </AnimatePresence>
                      <span className="relative flex items-center gap-1.5">
                        {s.completed ? <Check className="h-4 w-4" /> : null} Set {s.set_number}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </GlassCard>
            )
          })}

          <div className="flex gap-3 pt-2">
            <Link to="/library" className="btn-ghost flex-1">
              <Library className="h-4 w-4" /> Edit exercises
            </Link>
            <button className="btn-primary flex-1" onClick={finishEarly} disabled={finishing}>
              {finishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Finish workout <ChevronRight className="h-4 w-4" /></>}
            </button>
          </div>
        </div>
      </div>

      {/* Completion modal */}
      {createPortal(
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.7, y: 40, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                className="glass relative w-full max-w-md overflow-hidden p-8 text-center"
              >
                <div className="pointer-events-none absolute -top-24 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-accent/30 blur-3xl" />
                <motion.div
                  initial={{ rotate: -30, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', delay: 0.3 }}
                  className="relative mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-gradient-brand text-[#07090D] shadow-glow"
                >
                  <Trophy className="h-12 w-12" />
                </motion.div>
                <h2 className="relative mt-6 text-3xl font-bold">Workout crushed! 🎉</h2>
                <p className="relative mt-2 text-muted">You finished {workout.name}. Your streak just got hotter.</p>
                <div className="relative mt-6 grid grid-cols-3 gap-2">
                  {[
                    [`${result.workout.duration_minutes} min`, 'Duration'],
                    [result.sets_completed, 'Sets'],
                    [`~${estimateKcal(result.workout.duration_minutes)}`, 'kcal'],
                  ].map(([v, l]) => (
                    <div key={l} className="rounded-2xl bg-line/[0.05] py-3">
                      <p className="font-display text-xl font-bold">{v}</p>
                      <p className="text-xs text-muted">{l}</p>
                    </div>
                  ))}
                </div>
                <div className="relative mt-6 flex flex-col gap-2 sm:flex-row">
                  <Link to="/library" className="btn-ghost flex-1">
                    Plan another
                  </Link>
                  <Link to="/dashboard" className="btn-primary flex-1">
                    Back to dashboard
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
