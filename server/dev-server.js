// Local stand-in for Vercel's /api functions. Maps api/**/*.js to routes the same way Vercel does
// (api/auth/login.js -> /api/auth/login, api/sets/[id].js -> /api/sets/:id) and calls the default export.
import express from 'express'
import { readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { closeDb, isLocalDb, db } from '../lib/db.js'

if (existsSync('.env')) process.loadEnvFile('.env')

const PORT = Number(process.env.API_PORT || 3001)
const API_DIR = join(process.cwd(), 'api')

function findRoutes(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (name.startsWith('_') || name.startsWith('.')) return []
    if (statSync(full).isDirectory()) return findRoutes(full)
    return name.endsWith('.js') ? [full] : []
  })
}

function toRoute(file) {
  const path = relative(API_DIR, file)
    .split(sep)
    .join('/')
    .replace(/\.js$/, '')
    .replace(/(^|\/)index$/, '')
    .replace(/\[(\w+)\]/g, ':$1')
  return `/api/${path}`.replace(/\/$/, '')
}

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '100kb' }))

// Static routes before dynamic ones, like Vercel.
const routes = findRoutes(API_DIR)
  .map((file) => ({ file, route: toRoute(file) }))
  .sort((a, b) => a.route.includes(':') - b.route.includes(':'))

for (const { file, route } of routes) {
  const { default: fn } = await import(pathToFileURL(file).href)
  app.all(route, (req, res) => {
    // Vercel merges dynamic path segments into req.query.
    Object.defineProperty(req, 'query', { value: { ...req.query, ...req.params }, writable: true, configurable: true })
    return fn(req, res)
  })
}

app.use('/api', (req, res) => res.status(404).json({ error: 'NOT_FOUND', message: `No API route for ${req.method} ${req.originalUrl}` }))
app.use((err, req, res, _next) => {
  const bad = err.type === 'entity.parse.failed'
  res.status(bad ? 400 : 500).json({ error: bad ? 'BAD_JSON' : 'SERVER_ERROR', message: bad ? 'Request body must be valid JSON.' : 'Unexpected server error.' })
})

const server = app.listen(PORT, async () => {
  console.log(`API ready on http://localhost:${PORT}  (${routes.length} routes)`)
  for (const { route } of routes) console.log(`  ${route}`)
  if (!process.env.DATABASE_URL) console.log('  ⚠ DATABASE_URL is not set — API calls will return "database not connected".')
  else if (isLocalDb()) {
    // Open the local database now (applies schema + seed) so the first request is fast and errors show up here.
    try {
      const [c] = await db()`select (select count(*)::int from exercises) as exercises, (select count(*)::int from classes) as classes, (select count(*)::int from users) as users`
      console.log(`  Local database ready (${process.env.DATABASE_URL}): ${c.exercises} exercises, ${c.classes} classes, ${c.users} users`)
    } catch (err) {
      console.error('  ✖ Local database failed to open:', err.message)
    }
  } else console.log('  Using Neon database')
})

// Close the local database cleanly so its files aren't left mid-write.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    server.close()
    await closeDb().catch(() => {})
    process.exit(0)
  })
}
