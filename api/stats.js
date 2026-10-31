import { db } from '../lib/db.js'
import { handler } from '../lib/http.js'

// Public platform stats for the landing page.
export default handler({
  async GET(req, res) {
    const [stats] = await db()`
      select
        (select count(*)::int from users) as members,
        (select count(*)::int from workouts where status = 'completed') as workouts_completed,
        (select count(*)::int from classes
          where start_time >= date_trunc('week', now())
            and start_time <  date_trunc('week', now()) + interval '7 days') as classes_this_week`
    res.setHeader('Cache-Control', 'public, max-age=30')
    return stats
  },
})
