import { SignJWT, jwtVerify } from 'jose'
import { HttpError } from './http.js'

const COOKIE = 'pf_session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function secret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(process.env.JWT_SECRET)
}

function readCookie(req, name) {
  const header = req.headers.cookie || ''
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

function cookie(value, maxAge) {
  const secure = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`
}

export async function setSession(res, userId) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret())
  res.setHeader('Set-Cookie', cookie(token, MAX_AGE))
}

export function clearSession(res) {
  res.setHeader('Set-Cookie', cookie('', 0))
}

// Returns the logged-in user's id, or null.
export async function getUserId(req) {
  const token = readCookie(req, COOKIE)
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] })
    const id = Number(payload.sub)
    return Number.isInteger(id) ? id : null
  } catch {
    return null
  }
}

export async function requireUser(req) {
  const id = await getUserId(req)
  if (!id) throw new HttpError(401, 'Please log in to continue.', 'UNAUTHENTICATED')
  return id
}
