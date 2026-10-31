import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { CalendarDays, Dumbbell, Flame, LayoutDashboard, LogIn, LogOut, Timer, TrendingUp, User } from 'lucide-react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import Avatar from './Avatar'
import { useToast } from './Toast'
import { useAuth } from '../context/AuthContext'

export const navItems = [
  { to: '/dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard },
  { to: '/library', label: 'Workout Library', short: 'Library', icon: Dumbbell },
  { to: '/workout', label: 'Live Workout', short: 'Train', icon: Timer, primary: true },
  { to: '/progress', label: 'Progress', short: 'Progress', icon: TrendingUp },
  { to: '/classes', label: 'Class Booking', short: 'Classes', icon: CalendarDays },
  { to: '/profile', label: 'Profile', short: 'Profile', icon: User },
]

export function LogoutButton({ className = '' }) {
  const { logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const onClick = async () => {
    try {
      await logout()
      toast({ type: 'info', title: 'Logged out', message: 'See you at your next session 👋' })
      navigate('/')
    } catch (err) {
      toast({ type: 'error', title: "Couldn't log out", message: err.message })
    }
  }
  return (
    <button
      onClick={onClick}
      aria-label="Log out"
      title="Log out"
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line/10 bg-line/[0.04] text-muted transition hover:border-red-400/50 hover:text-red-400 ${className}`}
    >
      <LogOut className="h-[18px] w-[18px]" />
    </button>
  )
}

function Sidebar() {
  const { user } = useAuth()
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r divider bg-surface/40 p-6 backdrop-blur-2xl lg:flex">
      <Logo to="/" />
      <nav className="mt-10 flex flex-col gap-1.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="group relative">
            {({ isActive }) => (
              <span
                className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-colors ${
                  isActive ? 'text-ink' : 'text-muted hover:bg-line/[0.04] hover:text-ink'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-2xl border border-accent/30 bg-accent/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className={`relative h-5 w-5 ${isActive ? 'text-accent' : ''}`} />
                <span className="relative">{label}</span>
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        {user ? (
          <>
            <div className="glass !rounded-2xl p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Flame className="h-4 w-4 text-orange-400" /> Weekly goal
              </div>
              <p className="mt-1 text-xs text-muted">
                {user.weekly_goal_workouts} workouts · {user.weekly_goal_minutes} active min
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/profile" className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-1 transition hover:bg-line/[0.04]">
                <Avatar name={user.full_name} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.full_name}</p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
              </Link>
              <ThemeToggle />
              <LogoutButton />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-primary flex-1 !py-2.5">
              <LogIn className="h-4 w-4" /> Log in
            </Link>
            <ThemeToggle />
          </div>
        )}
      </div>
    </aside>
  )
}

function MobileTopBar() {
  const { user } = useAuth()
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b divider bg-bg/70 px-4 py-3 backdrop-blur-xl lg:hidden">
      <Logo to="/" />
      <div className="flex min-w-0 items-center gap-2">
        <ThemeToggle />
        {user ? (
          <>
            <Link to="/profile" aria-label="Profile" className="flex min-w-0 items-center gap-2">
              <span className="hidden max-w-[8rem] truncate text-sm font-semibold sm:block">{user.full_name}</span>
              <Avatar name={user.full_name} className="h-10 w-10" />
            </Link>
            <LogoutButton />
          </>
        ) : (
          <Link to="/login" className="btn-primary !px-4 !py-2 text-sm">
            Log in
          </Link>
        )}
      </div>
    </header>
  )
}

function BottomNav() {
  const items = navItems.filter((n) => n.to !== '/profile')
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t divider bg-surface/80 px-2 pt-2 backdrop-blur-2xl lg:hidden">
      <ul className="mx-auto flex max-w-md items-end justify-between">
        {items.map(({ to, short, icon: Icon, primary }) => (
          <li key={to} className="flex-1">
            <NavLink to={to} className="flex flex-col items-center gap-1 py-1">
              {({ isActive }) =>
                primary ? (
                  <>
                    <span className="-mt-7 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-[#07090D] shadow-glow ring-4 ring-bg">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className={`text-[11px] font-semibold ${isActive ? 'text-accent' : 'text-muted'}`}>{short}</span>
                  </>
                ) : (
                  <>
                    <span className="relative grid h-8 w-12 place-items-center">
                      {isActive && (
                        <motion.span
                          layoutId="bottom-active"
                          className="absolute inset-0 rounded-full bg-accent/15"
                          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                        />
                      )}
                      <Icon className={`relative h-5 w-5 ${isActive ? 'text-accent' : 'text-muted'}`} />
                    </span>
                    <span className={`text-[11px] font-semibold ${isActive ? 'text-ink' : 'text-muted'}`}>{short}</span>
                  </>
                )
              }
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function Layout() {
  const location = useLocation()
  const outlet = useOutlet()
  return (
    <div className="ambient min-h-[100dvh]">
      <Sidebar />
      <MobileTopBar />
      <main className="px-4 pb-32 pt-6 sm:px-6 lg:ml-72 lg:px-10 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
          <footer className="mt-16 flex flex-col items-center justify-between gap-2 border-t divider pt-6 text-xs text-muted sm:flex-row">
            <span>
              © {new Date().getFullYear()} <span className="font-semibold text-ink">PulseFit</span>. Train smarter. Get stronger.
            </span>
            <span>Made for people who show up.</span>
          </footer>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
