// Makes sure .env exists with a JWT_SECRET and a DATABASE_URL (falls back to a local database).
// Usage: node scripts/ensure-env.js
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'

const ENV = '.env'

if (!existsSync(ENV)) {
  copyFileSync('.env.example', ENV)
  console.log('✔ Created .env from .env.example')
}

let text = readFileSync(ENV, 'utf8')
const get = (key) => text.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1]?.trim().replace(/^["']|["']$/g, '') ?? ''

if (!get('JWT_SECRET')) {
  const secret = randomBytes(48).toString('base64url')
  text = /^JWT_SECRET=.*$/m.test(text)
    ? text.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secret}`)
    : `${text.trimEnd()}\nJWT_SECRET=${secret}\n`
  writeFileSync(ENV, text)
  console.log('✔ Generated a strong random JWT_SECRET and saved it to .env')
}

if (!get('DATABASE_URL')) {
  // No Neon database yet: use the local embedded Postgres so the app works out of the box.
  const local = 'DATABASE_URL=pglite://.data/pulsefit'
  text = /^DATABASE_URL=.*$/m.test(text) ? text.replace(/^DATABASE_URL=.*$/m, local) : `${text.trimEnd()}\n${local}\n`
  writeFileSync(ENV, text)
  console.log(`✔ No DATABASE_URL found, so PulseFit will use a local database (.data/pulsefit).
  To switch to Neon later: console.neon.tech -> your project -> Connect -> copy the postgresql:// string
  into DATABASE_URL in .env, run "npm run db:setup", then restart "npm run dev".`)
}
