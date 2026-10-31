import { handler } from '../../lib/http.js'
import { clearSession } from '../../lib/auth.js'

export default handler({
  async POST(req, res) {
    clearSession(res)
    return { ok: true }
  },
})
