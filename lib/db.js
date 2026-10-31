import { neon } from '@neondatabase/serverless'
import { mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// DATABASE_URL=postgresql://...      -> Neon (serverless HTTP driver; what Vercel uses)
// DATABASE_URL=pglite://.data/pulsefit -> local embedded Postgres for development (no account needed)
const LOCAL_PREFIX = 'pglite://'

let sql
let local

export const isLocalDb = (url = process.env.DATABASE_URL) => !!url?.startsWith(LOCAL_PREFIX)

// Returns a tagged-template query function: await db()`select ... where id = ${id}` -> rows[]
export function db() {
  const url = process.env.DATABASE_URL
  if (!url) {
    const err = new Error('DATABASE_URL is not set')
    err.dbUnreachable = true
    err.notConfigured = true
    throw err
  }
  sql ??= isLocalDb(url) ? localSql(url) : neon(url)
  return sql
}

function localSql(url) {
  local ??= openLocal(url.slice(LOCAL_PREFIX.length)).catch((err) => {
    local = sql = undefined // retry on the next request
    throw Object.assign(err, { dbUnreachable: true })
  })
  return async (strings, ...values) => {
    const pg = await local
    const text = strings.reduce((q, s, i) => `${q}$${i}${s}`)
    const { rows } = await pg.query(text, values)
    return rows
  }
}

// Opens the local database and applies schema + seed (both idempotent).
export async function openLocal(dir) {
  // Non-literal specifier so serverless bundlers don't pull the dev-only package into deployed functions.
  const pkg = '@electric-sql/pglite'
  const { PGlite } = await import(pkg)
  mkdirSync(resolve(dir), { recursive: true })
  const pg = await PGlite.create(resolve(dir))
  for (const file of ['db/schema.sql', 'db/seed.sql']) await pg.exec(readFileSync(file, 'utf8'))
  return pg
}

export async function closeDb() {
  if (local) await (await local).close()
}

const UNREACHABLE = /fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|getaddrinfo|password authentication failed|Endpoint .* (?:not found|disabled)|connect|network/i

export function isDbUnreachable(err) {
  if (err?.dbUnreachable) return true
  // Postgres errors carry a SQLSTATE code; connection problems usually don't (or are class 08 / 28).
  if (err?.code && !/^(08|28|57P0)/.test(err.code)) return false
  return UNREACHABLE.test(`${err?.message} ${err?.cause?.message ?? ''}`)
}
