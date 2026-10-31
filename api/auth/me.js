import { db } from '../../lib/db.js'
import { handler } from '../../lib/http.js'
import { getUserId, clearSession } from '../../lib/auth.js'
import { publicUser } from '../../lib/users.js'

export default handler({
  async GET(req, res) {
    const id = await getUserId(req)
    if (!id) return { user: null }
    const [user] = await db()`select * from users where id = ${id}`
    if (!user) {
      clearSession(res)
      return { user: null }
    }
    return { user: publicUser(user) }
  },
})
