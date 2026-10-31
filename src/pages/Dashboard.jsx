import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ArrowRight, CalendarDays, CheckCircle2, Clock, Dumbbell, Flame, Library, Play, Target, Timer, Zap } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import ProgressRing from '../components/ProgressRing'
import AnimatedCounter from '../components/AnimatedCounter'
import QuoteCard from '../components/QuoteCard'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { PageSkeleton } from '../components/Skeleton'
import useChartTheme from '../hooks/useChartTheme'
import useApi from '../hooks/useApi'
import { estimateMinutes, estimateKcal, workoutGroups } from '../lib/workout'
import { tint } from '../lib/color'

const greeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const intensityColor = { High: '#FF6B3D', Medium: '#C6FF3D', Low: '#B987FF' }

function ChartTooltip({ active, payload, label, t }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div
      className="rounded-xl px-3 py-2 text-sm shadow-xl backdrop-blur"
      style={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, color: t.ink }}
    >
      <p className="font-semibold">{label}</p>
      <p style={{ color: tint(t.lime) }}>{d.minutes} active min</p>
      <p className="text-xs opacity-70">
        {d.workouts} workout{d.workouts === 1 ? '' : 's'}
      </p>
    </div>
  )
}

function TodaysWorkoutCard({ workout }) {
  if (!workout || workout.exercises.length === 0) {
    return (
      <GlassCard index={0} className="flex flex-col justify-center lg:col-span-2" hover={false}>
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <span className="label">Today's workout</span>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">No workout yet today.</h2>
        <p className="mt-2 max-w-md text-muted">Pick one from the Library! Add a few exercises and they'll show up right here, ready to start.</p>
        <Link to="/library" className="btn-primary mt-6 self-start">
          <Library className="h-5 w-5" /> Browse the Library
        </Link>
      </GlassCard>
    )
  }

  const done = workout.status === 'completed'
  const minutes = done ? workout.duration_minutes : estimateMinutes(workout.exercises)
  const setsDone = workout.exercises.reduce((s, e) => s + e.set_list.filter((x) => x.completed).length, 0)
  const setsTotal = workout.exercises.reduce((s, e) => s + e.set_list.length, 0)

  return (
    <GlassCard index={0} className="lg:col-span-2" hover={false}>
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-24 h-60 w-60 rounded-full bg-cyan/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <span className="label">Today's workout</span>
          <h2 className="mt-2 text-4xl font-bold sm:text-5xl">{workout.name}</h2>
          <p className="mt-1 text-muted">{workoutGroups(workout.exercises).join(' · ')}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="chip"><Clock className="h-3.5 w-3.5" /> {done ? '' : '~'}{minutes} min</span>
            <span className="chip"><Flame className="h-3.5 w-3.5 text-orange-400" /> ~{estimateKcal(minutes)} kcal</span>
            <span className="chip"><Dumbbell className="h-3.5 w-3.5" /> {workout.exercises.length} exercises</span>
            {workout.status !== 'planned' && (
              <span className="chip !border-accent/30 !text-accent">
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
                {done ? 'Completed' : `${setsDone}/${setsTotal} sets`}
              </span>
            )}
          </div>
        </div>
        {done ? (
          <Link to="/library" className="btn-ghost shrink-0 !px-6 !py-4">
            Plan another <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link to="/workout" className="btn-primary group shrink-0 !px-8 !py-4 text-lg">
            <Play className="h-5 w-5 fill-current" /> {workout.status === 'in_progress' ? 'Continue' : 'Start'}
          </Link>
        )}
      </div>
      <div className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {workout.exercises.slice(0, 8).map((e, i) => {
          const exDone = e.set_list.length > 0 && e.set_list.every((s) => s.completed)
          return (
            <motion.div
              key={e.workout_exercise_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              className="rounded-2xl border divider bg-line/[0.03] p-3"
            >
              <p className="flex items-center gap-1 text-[11px] font-semibold text-accent">
                {String(i + 1).padStart(2, '0')} {exDone && <CheckCircle2 className="h-3 w-3" />}
              </p>
              <p className="mt-1 truncate text-sm font-semibold">{e.name}</p>
              <p className="text-xs text-muted">{e.sets} × {e.reps} · rest {e.rest_seconds}s</p>
            </motion.div>
          )
        })}
      </div>
    </GlassCard>
  )
}

export default function Dashboard() {
  const t = useChartTheme()
  const { data, error, loading, reload } = useApi('/dashboard')

  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const { user, todays_workout: workout, activity, streak, rings, upcoming_classes: upcoming } = data
  const todayIdx = activity.length - 1
  const ringList = [
    { key: 'workouts', label: 'Workouts', unit: '', color: '#C6FF3D', ...rings.workouts },
    { key: 'minutes', label: 'Active min', unit: 'm', color: '#22E4FF', ...rings.minutes },
    { key: 'goals', label: 'Goals hit', unit: '', color: '#B987FF', ...rings.goals },
  ]
  const change = data.activity_change_pct

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted">{greeting()},</p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            {user.full_name.split(' ')[0]} <span className="inline-block origin-[70%_70%] animate-[wave_2s_ease-in-out_1]">👋</span>
          </h1>
        </div>
        <span className="chip">
          <Target className="h-3.5 w-3.5 text-accent" /> Goal: {rings.workouts.goal} workouts · {rings.minutes.goal} min / week
        </span>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3">
        <TodaysWorkoutCard workout={workout} />

        {/* Streak */}
        <GlassCard index={1} className="flex flex-col justify-between">
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-orange-500/25 blur-3xl" />
          <div className="flex items-center justify-between">
            <span className="label">Current streak</span>
            <span className="chip">Best {streak.best}</span>
          </div>
          <div className="my-4 flex items-center gap-4">
            <motion.div
              animate={streak.current > 0 ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] } : {}}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className={`grid h-20 w-20 place-items-center rounded-3xl ${
                streak.current > 0 ? 'bg-gradient-to-br from-orange-400 to-rose-500 shadow-[0_0_40px_-6px_#fb923c]' : 'bg-line/[0.06]'
              }`}
            >
              <Flame className={`h-10 w-10 ${streak.current > 0 ? 'fill-yellow-200/60 text-white' : 'text-muted'}`} />
            </motion.div>
            <div>
              <p className="font-display text-6xl font-bold leading-none">
                <AnimatedCounter value={streak.current} duration={1.4} />
              </p>
              <p className="text-sm text-muted">
                {streak.current === 0 ? 'Finish a workout to start one' : `day${streak.current === 1 ? '' : 's'} in a row`}
              </p>
            </div>
          </div>
          <div className="flex justify-between gap-1">
            {streak.week.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
                <span
                  className={`grid h-8 w-full max-w-[2rem] place-items-center rounded-lg text-[11px] font-bold ${
                    d.done ? 'bg-gradient-to-br from-orange-400 to-rose-500 text-white' : d.date === data.today ? 'border border-dashed border-orange-400/50' : 'bg-line/[0.06] text-muted'
                  } ${d.future ? 'opacity-40' : ''}`}
                >
                  {d.done ? <Flame className="h-3.5 w-3.5" /> : ''}
                </span>
                <span className="text-[10px] text-muted">{d.day}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Progress rings */}
      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        {ringList.map((g, i) => (
          <GlassCard key={g.key} index={i + 2} className="flex flex-col items-center !p-3 text-center sm:!p-6">
            <div className="hidden sm:block">
              <ProgressRing value={g.value} max={g.goal} size={132} stroke={12} color={g.color} delay={0.3 + i * 0.15}>
                <RingLabel g={g} />
              </ProgressRing>
            </div>
            <div className="sm:hidden">
              <ProgressRing value={g.value} max={g.goal} size={92} stroke={9} color={g.color} delay={0.3 + i * 0.15}>
                <RingLabel g={g} small />
              </ProgressRing>
            </div>
            <p className="mt-3 text-xs font-semibold sm:text-sm">{g.label}</p>
            <p className="text-[11px] text-muted sm:text-xs">
              of {g.goal}
              {g.unit} {g.key === 'goals' ? 'goals' : 'goal'}
            </p>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Weekly chart */}
        <GlassCard index={5} className="lg:col-span-2" hover={false}>
          <div className="flex items-start justify-between">
            <div>
              <span className="label">Last 7 days</span>
              <p className="mt-1 font-display text-3xl font-bold">
                <AnimatedCounter value={data.activity_total} /> <span className="text-base font-medium text-muted">active min</span>
              </p>
            </div>
            {change !== null && (
              <span className={`chip ${change >= 0 ? '!text-accent' : '!text-orange-400'}`}>
                {change >= 0 ? '+' : ''}
                {change}% vs previous week
              </span>
            )}
          </div>
          <div className="mt-4 h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={t.lime} />
                    <stop offset="100%" stopColor={t.cyan} stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={t.grid} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: t.axis, fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: t.axis, fontSize: 12 }} allowDecimals={false} />
                <Tooltip cursor={{ fill: t.grid, radius: 12 }} content={<ChartTooltip t={t} />} />
                <Bar dataKey="minutes" radius={[10, 10, 10, 10]} maxBarSize={40} minPointSize={3} animationDuration={1400} animationEasing="ease-out">
                  {activity.map((d, i) => (
                    <Cell key={d.date} fill={i === todayIdx ? 'url(#barGrad)' : t.dark ? 'rgba(198,255,61,0.35)' : 'rgba(108,191,0,0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-5">
          <QuoteCard index={6} />
          <GlassCard index={7} className="flex-1">
            <div className="flex items-center justify-between">
              <span className="label">Upcoming classes</span>
              <Link to="/classes" className="-my-3 -mr-2 inline-flex min-h-[40px] items-center px-2 text-xs font-semibold text-accent hover:underline">See all</Link>
            </div>
            {upcoming.length ? (
              <ul className="mt-4 space-y-3">
                {upcoming.map((c) => {
                  const start = new Date(c.start_time)
                  return (
                    <li key={c.id} className="flex items-center gap-3">
                      <span className="h-10 w-1.5 rounded-full" style={{ background: intensityColor[c.intensity] }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{c.title}</p>
                        <p className="text-xs text-muted">
                          {start.toLocaleDateString(undefined, { weekday: 'short' })} ·{' '}
                          {start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} · {c.coach_name}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="mt-4 flex flex-col items-start gap-3">
                <p className="text-sm text-muted">No more classes scheduled this week. Check back soon!</p>
                <Link to="/classes" className="btn-ghost !px-4 !py-2 text-sm">
                  <CalendarDays className="h-4 w-4" /> Browse classes <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {workout && workout.exercises.length > 0 && !data.completed_today && (
        <EmptyState
          icon={Target}
          title="No sessions logged yet today"
          message={`Finish ${workout.name} to grow your streak and fill those rings.`}
          action={
            <Link to="/workout" className="btn-primary">
              <Timer className="h-4 w-4" /> Start Live Workout
            </Link>
          }
        />
      )}
    </div>
  )
}

function RingLabel({ g, small }) {
  return (
    <div>
      <p className={`font-display font-bold leading-none ${small ? 'text-lg' : 'text-3xl'}`}>
        <AnimatedCounter value={g.value} />
        <span className="text-[0.6em] text-muted">{g.unit}</span>
      </p>
      <p className={`mt-1 font-semibold text-muted ${small ? 'text-[10px]' : 'text-xs'}`}>
        {Math.round((g.value / g.goal) * 100)}%
      </p>
    </div>
  )
}
