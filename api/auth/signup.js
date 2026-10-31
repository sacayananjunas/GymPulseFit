import bcrypt from 'bcryptjs'
import { db } from '../../lib/db.js'
import { handler, body, HttpError } from '../../lib/http.js'
import { setSession } from '../../lib/auth.js'
import { publicUser } from '../../lib/users.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default handler({
  async POST(req, res) {
    const b = body(req)
    const fullName = String(b.full_name ?? '').trim()
    const email = String(b.email ?? '').trim().toLowerCase()
    const password = String(b.password ?? '')
    const goalWorkouts = Number(b.weekly_goal_workouts ?? 4)
    const goalMinutes = Number(b.weekly_goal_minutes ?? 180)

    if (fullName.length < 2 || fullName.length > 80) throw new HttpError(400, 'Please enter your name (2–80 characters).', 'INVALID_NAME')
    if (!EMAIL.test(email) || email.length > 254) throw new HttpError(400, 'That email address doesn’t look right.', 'INVALID_EMAIL')
    if (password.length < 8 || password.length > 72) throw new HttpError(400, 'Password must be 8–72 characters long.', 'INVALID_PASSWORD')
    if (!Number.isInteger(goalWorkouts) || goalWorkouts < 1 || goalWorkouts > 14) throw new HttpError(400, 'Weekly workouts goal must be between 1 and 14.', 'INVALID_GOAL')
    if (!Number.isInteger(goalMinutes) || goalMinutes < 10 || goalMinutes > 2000) throw new HttpError(400, 'Weekly minutes goal must be between 10 and 2000.', 'INVALID_GOAL')

    const hash = await bcrypt.hash(password, 10)
    const [user] = await db()`
      insert into users (email, password_hash, full_name, weekly_goal_workouts, weekly_goal_minutes)
      values (${email}, ${hash}, ${fullName}, ${goalWorkouts}, ${goalMinutes})
      on conflict (email) do nothing
      returning *`
    if (!user) throw new HttpError(409, 'An account with that email already exists. Try logging in instead.', 'EMAIL_TAKEN')

    await setSession(res, user.id)
    res.status(201).json({ user: publicUser(user) })
  },
})
