import bcrypt from 'bcryptjs'
import { db } from '../../lib/db.js'
import { handler, body, HttpError } from '../../lib/http.js'
import { setSession } from '../../lib/auth.js'
import { publicUser } from '../../lib/users.js'

// Compared against when the email doesn't exist, so response time doesn't reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync('pulsefit-timing-guard', 10)

export default handler({
  async POST(req, res) {
    const b = body(req)
    const email = String(b.email ?? '').trim().toLowerCase()
    const password = String(b.password ?? '')
    if (!email || !password) throw new HttpError(400, 'Please enter your email and password.', 'MISSING_FIELDS')

    const [user] = await db()`select * from users where email = ${email}`
    const ok = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH)
    if (!user || !ok) throw new HttpError(401, 'Email or password is incorrect.', 'INVALID_CREDENTIALS')

    await setSession(res, user.id)
    return { user: publicUser(user) }
  },
})
