import { isDbUnreachable } from './db.js'

export class HttpError extends Error {
  constructor(status, message, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

// Wraps a Vercel-style handler: method routing, JSON errors, friendly DB-down message.
export function handler(methods) {
  return async (req, res) => {
    const fn = methods[req.method]
    if (!fn) {
      res.setHeader('Allow', Object.keys(methods).join(', '))
      return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: `${req.method} is not supported here.` })
    }
    try {
      const result = await fn(req, res)
      if (!res.headersSent) res.status(200).json(result ?? { ok: true })
    } catch (err) {
      if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.code || 'ERROR', message: err.message })
      }
      if (err.notConfigured) {
        console.error('[db] DATABASE_URL is not set')
        return res.status(503).json({
          error: 'DB_NOT_CONFIGURED',
          message: "PulseFit's database isn't connected yet. Add DATABASE_URL to the .env file, then restart the server.",
        })
      }
      if (isDbUnreachable(err)) {
        console.error('[db] unreachable:', err.message)
        return res.status(503).json({
          error: 'DB_UNREACHABLE',
          message: "We can't reach the PulseFit database right now. Check your connection and try again in a moment.",
        })
      }
      console.error(`[api] ${req.method} ${req.url} failed:`, err)
      return res.status(500).json({ error: 'SERVER_ERROR', message: 'Something went wrong on our side. Please try again.' })
    }
  }
}

export function body(req) {
  if (req.body && typeof req.body === 'object') return req.body
  try {
    return JSON.parse(req.body || '{}')
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON.', 'BAD_JSON')
  }
}

export function intParam(value, name) {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, `Invalid ${name}.`, 'BAD_REQUEST')
  return n
}
