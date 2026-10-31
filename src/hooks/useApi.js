import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'

// GET a path on mount. `setData` allows optimistic local updates; `reload` re-fetches quietly.
export default function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const alive = useRef(true)

  const load = useCallback(
    async ({ quiet = false } = {}) => {
      if (!quiet) setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const data = await api(path)
        if (alive.current) setState({ data, error: null, loading: false })
        return data
      } catch (error) {
        if (alive.current) setState((s) => ({ data: quiet ? s.data : null, error, loading: false }))
        if (quiet) throw error
      }
    },
    [path],
  )

  useEffect(() => {
    alive.current = true
    load()
    return () => {
      alive.current = false
    }
  }, [load])

  const setData = useCallback((fn) => setState((s) => ({ ...s, data: typeof fn === 'function' ? fn(s.data) : fn })), [])

  return { ...state, setData, reload: load }
}
