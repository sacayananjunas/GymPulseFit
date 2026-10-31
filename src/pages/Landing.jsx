import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Dumbbell,
  Flame,
  HeartPulse,
  Play,
  Timer,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import AnimatedCounter from '../components/AnimatedCounter'
import ProgressRing from '../components/ProgressRing'
import QuoteCard from '../components/QuoteCard'
import { Skeleton } from '../components/Skeleton'
import { LogoutButton } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import useApi from '../hooks/useApi'

// Illustrative card in the hero artwork (not user data).
const heroDemo = { title: 'Push Power', subtitle: 'Chest · Shoulders · Triceps', intensity: 'High', streak: 12 }

const features = [
  { icon: Dumbbell, title: 'Smart workout library', text: 'Over a hundred moves, filtered by muscle group, with sets, reps and difficulty dialled in.' },
  { icon: Timer, title: 'Live workout mode', text: 'A big rest timer, tap-to-complete sets and a celebration when you finish.' },
  { icon: TrendingUp, title: 'Progress you can see', text: 'Strength curves, personal records and trophies that keep you coming back.' },
  { icon: CalendarDays, title: 'Book classes in a tap', text: 'Yoga, HIIT, Spin and Boxing, with live spot counts so you never miss out.' },
  { icon: Flame, title: 'Streaks that stick', text: 'Daily streaks and weekly goals turn showing up into a habit.' },
  { icon: Trophy, title: 'Achievements & badges', text: 'Unlock badges as you level up, from Early Bird to PR Machine.' },
]

const statItems = [
  { key: 'members', label: 'Members' },
  { key: 'workouts_completed', label: 'Workouts completed' },
  { key: 'classes_this_week', label: 'Classes this week' },
]

const word = {
  hidden: { opacity: 0, y: 40, rotateX: -40 },
  show: (i) => ({ opacity: 1, y: 0, rotateX: 0, transition: { delay: 0.15 + i * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] } }),
}

function HeroVisual() {
  return (
    <div className="relative mx-auto h-[440px] w-full max-w-md sm:h-[500px]">
      <div className="absolute inset-0 -z-10 rounded-full bg-gradient-brand opacity-20 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 40, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: -4 }}
        transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="glass absolute left-[11%] top-4 w-[78%] p-6"
      >
        <div className="flex items-center justify-between">
          <span className="label">Today</span>
          <span className="chip !text-accent">
            <Zap className="h-3 w-3" /> {heroDemo.intensity}
          </span>
        </div>
        <h3 className="mt-2 text-2xl font-bold">{heroDemo.title}</h3>
        <p className="text-sm text-muted">{heroDemo.subtitle}</p>
        <div className="mt-6 flex justify-center">
          <ProgressRing value={72} size={170} stroke={14} color="#C6FF3D" color2="#22E4FF" delay={0.8} duration={2}>
            <div>
              <p className="font-display text-4xl font-bold">
                <AnimatedCounter value={72} />%
              </p>
              <p className="text-xs text-muted">weekly goal</p>
            </div>
          </ProgressRing>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          {[
            ['48', 'min'],
            ['420', 'kcal'],
            ['4', 'moves'],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl bg-line/[0.04] py-2">
              <p className="font-display text-lg font-bold">{v}</p>
              <p className="text-[11px] text-muted">{l}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        className="absolute bottom-10 left-0"
      >
        <div className="glass flex animate-float items-center gap-3 !rounded-2xl p-3 pr-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500/15 text-orange-400">
            <Flame className="h-6 w-6" />
          </span>
          <div>
            <p className="font-display text-xl font-bold leading-none">{heroDemo.streak} days</p>
            <p className="text-xs text-muted">streak 🔥</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.1, duration: 0.7 }}
        className="absolute bottom-24 right-2"
      >
        <div className="glass flex animate-float items-center gap-3 !rounded-2xl p-3 pr-5 [animation-delay:1.5s]">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-cyan/15 text-cyan">
            <HeartPulse className="h-6 w-6" />
          </span>
          <div>
            <p className="font-display text-xl font-bold leading-none">142 bpm</p>
            <svg viewBox="0 0 100 20" className="mt-1 h-4 w-24">
              <path d="M0 10h25l5-8 8 16 6-12 4 4h52" fill="none" stroke="#22E4FF" strokeOpacity="0.35" strokeWidth="2" />
              <path
                d="M0 10h25l5-8 8 16 6-12 4 4h52"
                fill="none"
                stroke="#22E4FF"
                strokeWidth="2"
                strokeDasharray="40 160"
                className="animate-pulseLine"
              />
            </svg>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3, type: 'spring' }}
        className="absolute right-6 top-0 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-[#07090D] shadow-glow"
      >
        <Trophy className="h-7 w-7" />
      </motion.div>
    </div>
  )
}

export default function Landing() {
  const { user } = useAuth()
  const stats = useApi('/stats')
  const startTo = user ? '/dashboard' : '/signup'
  const headline = ['Train', 'smarter.']
  const headline2 = ['Get', 'stronger.']

  return (
    <div className="ambient relative min-h-[100dvh] overflow-x-hidden">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10 h-[900px]" />

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b divider bg-bg/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
            <Link to="/library" className="transition hover:text-ink">Workouts</Link>
            <Link to="/classes" className="transition hover:text-ink">Classes</Link>
            <Link to="/progress" className="transition hover:text-ink">Progress</Link>
            <a href="#features" className="transition hover:text-ink">Features</a>
          </nav>
          <div className="flex min-w-0 items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <span className="hidden max-w-[10rem] truncate text-sm font-semibold sm:block">Hi, {user.full_name.split(' ')[0]}</span>
                <Link to="/dashboard" className="btn-primary !px-4 !py-2.5 text-sm">
                  Open app <ArrowRight className="h-4 w-4" />
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link to="/login" className="hidden px-3 text-sm font-semibold text-muted transition hover:text-ink sm:block">
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary !px-4 !py-2.5 text-sm">
                  Sign up <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pt-20">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="chip mb-6 !border-accent/30 !bg-accent/10 !text-accent"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            PulseFit 2.0 — now with live workouts
          </motion.span>

          <h1 className="font-display text-[3.2rem] font-bold leading-[0.95] tracking-tighter sm:text-7xl lg:text-[5.5rem]" style={{ perspective: 800 }}>
            <span className="block">
              {headline.map((w, i) => (
                <Fragment key={w}>
                  {i > 0 && ' '}
                  <motion.span custom={i} variants={word} initial="hidden" animate="show" className="inline-block">
                    {w}
                  </motion.span>
                </Fragment>
              ))}
            </span>
            <span className="block">
              {headline2.map((w, i) => (
                <Fragment key={w}>
                  {i > 0 && ' '}
                  <motion.span
                    custom={i + 2}
                    variants={word}
                    initial="hidden"
                    animate="show"
                    className={`inline-block ${i === 1 ? 'text-gradient italic pr-[0.08em]' : ''}`}
                  >
                    {w}
                  </motion.span>
                </Fragment>
              ))}
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-6 max-w-xl text-lg text-muted"
          >
            <span className="font-semibold text-ink">PulseFit</span> plans your workouts, tracks every rep, books your
            favourite classes and keeps your streak alive. Your whole gym life, in your pocket.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link to={startTo} className="btn-primary group px-8 py-4 text-lg">
              <Play className="h-5 w-5 fill-current" /> Start Your Workout
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to={user ? '/dashboard' : '/login'} className="btn-ghost px-8 py-4 text-lg">
              {user ? 'View dashboard' : 'I already have an account'}
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-12 grid grid-cols-3 gap-3 sm:gap-6"
          >
            {statItems.map((s, i) => (
              <div key={s.key} className={`${i > 0 ? 'border-l divider pl-3 sm:pl-6' : ''}`}>
                <div className="font-display text-2xl font-bold sm:text-4xl">
                  {stats.loading ? (
                    <Skeleton className="h-8 w-16 sm:h-10 sm:w-24" />
                  ) : stats.data ? (
                    <AnimatedCounter value={stats.data[s.key]} format="compact" duration={2.4} />
                  ) : (
                    <span className="text-muted" title={stats.error?.message}>—</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted sm:text-sm">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <HeroVisual />
      </section>

      {/* Marquee */}
      <div className="relative overflow-hidden border-y divider py-5">
        <motion.div
          className="flex w-max gap-12 whitespace-nowrap font-display text-2xl font-bold uppercase tracking-tight text-muted/80 dark:text-muted/70 sm:text-3xl"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {[...Array(2)].flatMap((_, k) =>
            ['Strength', 'HIIT', 'Yoga', 'Spin', 'Boxing', 'Mobility', 'Cardio', 'Core'].map((t) => (
              <span key={`${k}-${t}`} className="flex items-center gap-12">
                {t} <Zap className="h-5 w-5 text-accent" />
              </span>
            )),
          )}
        </motion.div>
      </div>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <p className="label mb-3 !text-accent">Everything you need</p>
          <h2 className="text-4xl font-bold sm:text-5xl">
            Built for the grind. <span className="text-gradient">Designed for the glow.</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: (i % 3) * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="glass group p-6 transition-shadow hover:shadow-glow"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent transition group-hover:bg-gradient-brand group-hover:text-[#07090D]">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-brand p-8 text-[#07090D] sm:p-12"
          >
            <HeartPulse className="absolute -bottom-8 -right-8 h-56 w-56 opacity-10" />
            <h2 className="max-w-lg text-4xl font-bold sm:text-5xl">Your next PR starts today.</h2>
            <p className="mt-3 max-w-md font-medium opacity-80">
              {stats.data?.members
                ? `Join ${stats.data.members.toLocaleString()} ${stats.data.members === 1 ? 'member' : 'members'} training smarter with PulseFit.`
                : 'Be one of the first to train smarter with PulseFit.'}
            </p>
            <Link
              to={startTo}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#07090D] px-7 py-4 font-display font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Start Your Workout <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
          <QuoteCard />
        </div>
      </section>

      <footer className="border-t divider">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
          <Logo />
          <p>© {new Date().getFullYear()} PulseFit. Train smarter. Get stronger.</p>
        </div>
      </footer>
    </div>
  )
}
