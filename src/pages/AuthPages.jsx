import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, Eye, EyeOff, Flame, Loader2, Minus, Plus, Timer } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="ambient relative flex min-h-[100dvh] flex-col overflow-x-hidden">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10" />
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="glass relative w-full max-w-md overflow-hidden p-6 sm:p-8"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-cyan/15 blur-3xl" />
          <div className="relative">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="mt-1.5 text-muted">{subtitle}</p>
            <div className="mt-7">{children}</div>
            <p className="mt-6 text-center text-sm text-muted">{footer}</p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

function PasswordInput({ value, onChange, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        className="input pr-12"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder="••••••••"
        required
        minLength={8}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  )
}

function FormError({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300 dark:text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="text-ink">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SubmitButton({ busy, children }) {
  return (
    <button type="submit" className="btn-primary group mt-2 w-full !py-4 text-base" disabled={busy}>
      {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : children}
      {!busy && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
    </button>
  )
}

export function Login() {
  const { user, login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const from = useLocation().state?.from || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (user && !busy) return <Navigate to={from} replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const u = await login(email, password)
      toast({ title: `Welcome back, ${u.full_name.split(' ')[0]}! 💪`, message: "Let's get after it." })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to pick up where you left off."
      footer={
        <>
          New to PulseFit?{' '}
          <Link to="/signup" className="font-semibold text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />
        <Field label="Email">
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" required />
        </Field>
        <Field label="Password">
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </Field>
        <SubmitButton busy={busy}>Log in</SubmitButton>
      </form>
    </AuthShell>
  )
}

export function Signup() {
  const { user, signup } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', weekly_goal_workouts: 4, weekly_goal_minutes: 180 })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  if (user && !busy) return <Navigate to="/dashboard" replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const u = await signup({ ...form, weekly_goal_minutes: Number(form.weekly_goal_minutes) })
      toast({ title: `You're in, ${u.full_name.split(' ')[0]}! 🎉`, message: 'Pick a few exercises from the Library to build today’s workout.' })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const workouts = form.weekly_goal_workouts
  const stepWorkouts = (d) => setForm((f) => ({ ...f, weekly_goal_workouts: Math.min(14, Math.max(1, f.weekly_goal_workouts + d)) }))

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set your weekly goals and start training smarter."
      footer={
        <>
          Already a member?{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />
        <Field label="Full name">
          <input className="input" value={form.full_name} onChange={set('full_name')} autoComplete="name" placeholder="Alex Rivera" required minLength={2} maxLength={80} />
        </Field>
        <Field label="Email">
          <input type="email" className="input" value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" required />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <PasswordInput value={form.password} onChange={set('password')} autoComplete="new-password" />
        </Field>

        <div className="grid gap-3 pt-1 sm:grid-cols-2">
          <div className="rounded-2xl border divider bg-line/[0.03] p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Flame className="h-4 w-4 text-orange-400" /> Workouts / week
            </p>
            <div className="mt-3 flex items-center justify-between">
              <button type="button" onClick={() => stepWorkouts(-1)} className="btn-ghost !h-9 !w-9 !rounded-xl !p-0" aria-label="Fewer workouts">
                <Minus className="h-4 w-4" />
              </button>
              <motion.span key={workouts} initial={{ scale: 1.3, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-3xl font-bold">
                {workouts}
              </motion.span>
              <button type="button" onClick={() => stepWorkouts(1)} className="btn-ghost !h-9 !w-9 !rounded-xl !p-0" aria-label="More workouts">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="rounded-2xl border divider bg-line/[0.03] p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Timer className="h-4 w-4 text-cyan" /> Active min / week
            </p>
            <p className="mt-2 font-display text-3xl font-bold">{form.weekly_goal_minutes}</p>
            <input
              type="range"
              min={30}
              max={600}
              step={15}
              value={form.weekly_goal_minutes}
              onChange={set('weekly_goal_minutes')}
              className="mt-1 w-full"
              aria-label="Weekly active minutes goal"
            />
          </div>
        </div>

        <SubmitButton busy={busy}>Create account</SubmitButton>
      </form>
    </AuthShell>
  )
}
