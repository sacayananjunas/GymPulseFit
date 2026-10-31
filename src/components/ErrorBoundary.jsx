import { Component } from 'react'
import { RefreshCw, ZapOff } from 'lucide-react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('PulseFit crashed:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="ambient grid min-h-[100dvh] place-items-center px-6">
        <div className="glass max-w-md p-8 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-red-500/10 text-red-400">
            <ZapOff className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">Whoa, we pulled a muscle.</h1>
          <p className="mt-2 text-muted">
            Something went wrong on our side. Take a breather — a quick reload usually gets things moving again.
          </p>
          <button className="btn-primary mt-6" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" /> Reload PulseFit
          </button>
        </div>
      </div>
    )
  }
}
