import { useState } from 'react'
import { motion } from 'framer-motion'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Award, Medal, TrendingUp, Trophy } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import GlassCard from '../components/GlassCard'
import AnimatedCounter from '../components/AnimatedCounter'
import useChartTheme from '../hooks/useChartTheme'
import { personalRecords, strengthHistory } from '../data/mock'
import { tint } from '../lib/color'

const tiers = {
  gold: { from: '#FFE27A', to: '#F5A524', label: 'Gold' },
  silver: { from: '#F1F5F9', to: '#94A3B8', label: 'Silver' },
  bronze: { from: '#F6B98A', to: '#B4642D', label: 'Bronze' },
}

export default function Progress() {
  const t = useChartTheme()
  const lifts = [
    { key: 'deadlift', label: 'Deadlift', color: t.lime },
    { key: 'squat', label: 'Squat', color: t.cyan },
    { key: 'bench', label: 'Bench', color: t.violet },
  ]
  const [visible, setVisible] = useState(() => lifts.map((l) => l.key))
  const first = strengthHistory[0]
  const last = strengthHistory[strengthHistory.length - 1]

  const toggle = (k) =>
    setVisible((v) => (v.includes(k) ? (v.length > 1 ? v.filter((x) => x !== k) : v) : [...v, k]))

  return (
    <div>
      <PageHeader eyebrow="Progress" title="Look how far you've come" subtitle="Six months of strength gains, all in one place." />

      <div className="mb-5 grid grid-cols-3 gap-3 sm:gap-5">
        {lifts.map((l, i) => {
          const gain = last[l.key] - first[l.key]
          const pct = Math.round((gain / first[l.key]) * 100)
          return (
            <GlassCard key={l.key} index={i} className="!p-4 sm:!p-6">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl" style={{ background: l.color + '30' }} />
              <span className="label">{l.label}</span>
              <p className="mt-2 font-display text-2xl font-bold sm:text-4xl">
                <AnimatedCounter value={last[l.key]} />
                <span className="text-sm font-medium text-muted"> kg</span>
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold" style={{ color: tint(l.color) }}>
                <TrendingUp className="h-3.5 w-3.5" /> +{gain}kg <span className="hidden sm:inline">({pct}%)</span>
              </p>
            </GlassCard>
          )
        })}
      </div>

      <GlassCard index={3} hover={false}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="label">Strength over time</span>
            <p className="mt-1 text-sm text-muted">Best working set (kg) per month</p>
          </div>
          <div className="flex gap-2">
            {lifts.map((l) => {
              const on = visible.includes(l.key)
              return (
                <button
                  key={l.key}
                  onClick={() => toggle(l.key)}
                  className={`chip !py-2.5 transition ${on ? '' : 'opacity-40'}`}
                  aria-pressed={on}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                  {l.label}
                </button>
              )
            })}
          </div>
        </div>
        <div className="mt-6 h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={strengthHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={t.grid} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: t.axis, fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: t.axis, fontSize: 12 }} domain={['dataMin - 10', 'dataMax + 10']} />
              <Tooltip
                contentStyle={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, borderRadius: 12, color: t.ink }}
                labelStyle={{ color: t.ink, fontWeight: 600 }}
                formatter={(v, name) => [`${v} kg`, lifts.find((l) => l.key === name)?.label]}
              />
              {lifts
                .filter((l) => visible.includes(l.key))
                .map((l) => (
                  <Line
                    key={l.key}
                    type="monotone"
                    dataKey={l.key}
                    stroke={l.color}
                    strokeWidth={3}
                    dot={{ r: 4, fill: l.color, strokeWidth: 0 }}
                    activeDot={{ r: 7, stroke: l.color, strokeOpacity: 0.3, strokeWidth: 8 }}
                    animationDuration={1600}
                    style={{ filter: `drop-shadow(0 0 6px ${l.color}66)` }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="mb-4 mt-10 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-accent" />
        <h2 className="text-2xl font-bold">Personal records</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {personalRecords.map((pr, i) => {
          const tier = tiers[pr.tier]
          const Icon = pr.tier === 'gold' ? Trophy : pr.tier === 'silver' ? Medal : Award
          return (
            <GlassCard key={pr.lift} index={i + 4} className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: [0, -12, 12, 0], scale: 1.08 }}
                className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl"
                style={{ background: `linear-gradient(135deg, ${tier.from}, ${tier.to})`, boxShadow: `0 0 30px -8px ${tier.to}` }}
              >
                <Icon className="h-8 w-8 text-black/70" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold">{pr.lift}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tint(tier.to) }}>
                    {tier.label}
                  </span>
                </div>
                <p className="font-display text-2xl font-bold">
                  {pr.value}
                  <span className="text-sm font-medium text-muted"> {pr.unit}</span>
                </p>
                <p className="text-xs text-muted">
                  {pr.date} · <span className="font-semibold text-accent">{pr.delta}</span>
                </p>
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
