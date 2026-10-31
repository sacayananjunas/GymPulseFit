import { DatabaseZap, RefreshCw, WifiOff, ZapOff } from 'lucide-react'
import EmptyState from './EmptyState'

const variants = {
  DB_UNREACHABLE: { icon: DatabaseZap, title: "Can't reach the database" },
  DB_NOT_CONFIGURED: { icon: DatabaseZap, title: 'Database not connected yet' },
  NETWORK: { icon: WifiOff, title: "You're offline" },
  SERVER_DOWN: { icon: ZapOff, title: 'Server is warming up' },
}

export default function ErrorState({ error, onRetry }) {
  const v = variants[error?.code] ?? { icon: ZapOff, title: 'Something went wrong' }
  return (
    <EmptyState
      icon={v.icon}
      title={v.title}
      message={error?.message || 'Please try again in a moment.'}
      action={
        onRetry && (
          <button className="btn-primary" onClick={() => onRetry()}>
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        )
      }
    />
  )
}
