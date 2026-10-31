import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Crown, Dumbbell, Flame, Flower2, Lock, Medal, Moon, Sunrise, Timer, Trophy, Users } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Avatar from '../components/Avatar'
import AnimatedCounter from '../components/AnimatedCounter'
import ProgressRing from '../components/ProgressRing'
import { useToast } from '../components/Toast'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { achievements, user } from '../data/mock'

const icons = { flame: Flame, dumbbell: Dumbbell, sunrise: Sunrise, trophy: Trophy, users: Users, medal: Medal, timer: Timer, flower: Flower2 }

function Switch({ on, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className="-my-1.5 py-1.5"
    >
      <span className={`relative block h-7 w-12 rounded-full transition ${on ? 'bg-gradient-brand' : 'bg-line/15'}`}>
        <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${on ? 'right-1' : 'left-1'}`} />
      </span>
    </button>
  )
}

export default function Profile() {
  const { theme, toggleTheme, bookings } = useApp()
  const { user: me } = useAuth()
  const memberSince = new Date(me.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const toast = useToast()
  const unlocked = achievements.filter((a) => a.unlocked).length

  return (
    <div className="space-y-5">
      {/* Header card */}
      <GlassCard hover={false} className="!p-0">
        <div className="relative h-32 overflow-hidden bg-gradient-brand sm:h-40">
          <div className="grid-bg absolute inset-0 opacity-60" />
          <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="absolute bottom-6 h-12 w-full opacity-30">
            <path d="M0 30h120l12-24 18 48 14-36 10 12h226" fill="none" stroke="#07090D" strokeWidth="3" />
          </svg>
        </div>
        <div className="flex flex-col gap-5 px-5 pb-6 sm:flex-row sm:items-end sm:px-8">
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="-mt-14 sm:-mt-16">
            <Avatar name={me.full_name} className="h-28 w-28 ring-4 ring-bg sm:h-32 sm:w-32" />
          </motion.div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{me.full_name}</h1>
            <p className="text-muted">{me.email} · Member since {memberSince}</p>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-2xl bg-gradient-brand px-4 py-2 font-display font-semibold text-[#07090D] shadow-glow sm:self-auto">
            <Crown className="h-4 w-4" /> {user.membership}
          </span>
        </div>
      </GlassCard>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Level */}
        <GlassCard index={1} className="flex items-center gap-5">
          <ProgressRing value={user.xp} max={user.xpNext} size={110} stroke={10} color="#C6FF3D" color2="#22E4FF">
            <div>
              <p className="text-[10px] font-semibold uppercase text-muted">Level</p>
              <p className="font-display text-3xl font-bold leading-none">{user.level}</p>
            </div>
          </ProgressRing>
          <div>
            <span className="label">Experience</span>
            <p className="mt-1 font-display text-2xl font-bold">
              <AnimatedCounter value={user.xp} /> <span className="text-sm text-muted">/ {user.xpNext.toLocaleString()} XP</span>
            </p>
            <p className="mt-1 text-sm text-muted">{(user.xpNext - user.xp).toLocaleString()} XP to level {user.level + 1}</p>
          </div>
        </GlassCard>

        {/* Stats */}
        <GlassCard index={2} className="grid grid-cols-3 gap-2 text-center lg:col-span-2">
          {[
            { label: 'Workouts', value: user.stats.workouts, icon: Dumbbell },
            { label: 'Hours trained', value: user.stats.hours, icon: Timer },
            { label: 'PRs set', value: user.stats.prs, icon: Trophy },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center justify-center rounded-2xl bg-line/[0.03] py-4">
              <s.icon className="mb-2 h-5 w-5 text-accent" />
              <p className="font-display text-3xl font-bold sm:text-4xl">
                <AnimatedCounter value={s.value} />
              </p>
              <p className="text-xs text-muted sm:text-sm">{s.label}</p>
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Achievements */}
      <div>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Achievements</h2>
          <span className="text-sm text-muted">
            <span className="font-semibold text-accent">{unlocked}</span> / {achievements.length} unlocked
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {achievements.map((a, i) => {
            const Icon = icons[a.icon]
            return (
              <motion.button
                key={a.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
                whileHover={{ y: -6 }}
                onClick={() =>
                  toast(
                    a.unlocked
                      ? { title: `${a.title} unlocked 🏅`, message: a.desc }
                      : { type: 'info', title: `${Math.round(a.progress * 100)}% to ${a.title}`, message: a.desc },
                  )
                }
                className={`glass group relative flex flex-col items-center overflow-hidden p-5 text-center transition-shadow hover:shadow-glow ${a.unlocked ? '' : 'opacity-70'}`}
              >
                {a.unlocked && (
                  <div className="pointer-events-none absolute -top-10 h-24 w-24 rounded-full blur-2xl" style={{ background: a.color + '40' }} />
                )}
                <div className="relative">
                  {a.unlocked ? (
                    <motion.span
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      className="grid h-16 w-16 place-items-center rounded-full"
                      style={{ background: `radial-gradient(circle at 30% 30%, ${a.color}, ${a.color}55)`, boxShadow: `0 0 28px -6px ${a.color}` }}
                    >
                      <Icon className="h-8 w-8 text-[#07090D]" />
                    </motion.span>
                  ) : (
                    <ProgressRing value={a.progress} max={1} size={64} stroke={5} color={a.color} delay={0.4 + i * 0.05}>
                      <Lock className="h-5 w-5 text-muted" />
                    </ProgressRing>
                  )}
                </div>
                <p className="relative mt-3 text-sm font-semibold">{a.title}</p>
                <p className="relative mt-0.5 text-xs text-muted">{a.desc}</p>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Settings */}
      <GlassCard index={3} hover={false}>
        <h2 className="mb-4 text-xl font-bold">Preferences</h2>
        <div className="divide-y divide-line/[0.08]">
          <div className="flex items-center justify-between py-3">
            <span className="flex items-center gap-3"><Moon className="h-5 w-5 text-muted" /> Dark mode</span>
            <Switch on={theme === 'dark'} onChange={toggleTheme} label="Dark mode" />
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="flex items-center gap-3"><Bell className="h-5 w-5 text-muted" /> Class reminders</span>
            <ReminderSwitch toast={toast} />
          </div>
          <div className="flex items-center justify-between py-3 text-sm text-muted">
            <span>Upcoming bookings</span>
            <span className="font-semibold text-ink">{bookings.length}</span>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

function ReminderSwitch({ toast }) {
  const [on, setOn] = useState(true)
  return (
    <Switch
      on={on}
      label="Class reminders"
      onChange={() => {
        setOn(!on)
        toast({ type: 'info', title: on ? 'Reminders off' : 'Reminders on 🔔', message: on ? "We'll keep quiet." : "We'll nudge you 1 hour before class." })
      }}
    />
  )
}
