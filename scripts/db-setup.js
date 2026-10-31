// Runs db/schema.sql then db/seed.sql against DATABASE_URL. Safe to run repeatedly.
import { readFileSync } from 'node:fs'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { isLocalDb, openLocal } from '../lib/db.js'

process.loadEnvFile('.env')
const url = process.env.DATABASE_URL

const COUNTS = `
  select 'exercises' as table, count(*)::int as rows from exercises
  union all select 'classes', count(*)::int from classes
  union all select 'classes this week', count(*)::int from classes
    where start_time >= date_trunc('week', now()) and start_time < date_trunc('week', now()) + interval '7 days'
  union all select 'users', count(*)::int from users`

async function setupLocal() {
  // The embedded database can only be opened by one process at a time.
  const apiRunning = await fetch(`http://localhost:${process.env.API_PORT || 3001}/api/stats`).then(() => true, () => false)
  if (apiRunning) {
    console.log('ℹ The dev server is running and already applied schema.sql + seed.sql to the local database on startup.')
    console.log('  Stop "npm run dev" first if you want to run db:setup by hand.')
    return
  }
  const pg = await openLocal(url.slice('pglite://'.length))
  console.log(`✔ Ran db/schema.sql and db/seed.sql on the local database (${url})`)
  console.table((await pg.query(COUNTS)).rows)
  await pg.close()
}

async function setupNeon() {
  neonConfig.webSocketConstructor = WebSocket
  const pool = new Pool({ connectionString: url })
  try {
    for (const file of ['db/schema.sql', 'db/seed.sql']) {
      await pool.query(readFileSync(file, 'utf8'))
      console.log(`✔ Ran ${file}`)
    }
    console.table((await pool.query(COUNTS)).rows)
  } finally {
    await pool.end()
  }
}

try {
  await (isLocalDb(url) ? setupLocal() : setupNeon())
} catch (err) {
  console.error('✖ Database setup failed:', err.message)
  process.exitCode = 1
}
