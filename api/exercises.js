import { db } from '../lib/db.js'
import { handler, HttpError } from '../lib/http.js'

const GROUPS = ['Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']

export default handler({
  async GET(req) {
    const group = req.query.group
    if (group && group !== 'All' && !GROUPS.includes(group)) throw new HttpError(400, 'Unknown muscle group.', 'BAD_GROUP')
    const sql = db()
    const exercises =
      group && group !== 'All'
        ? await sql`select id, name, muscle_group, sets, reps, difficulty, rest_seconds, description
                    from exercises where muscle_group = ${group} order by name`
        : await sql`select id, name, muscle_group, sets, reps, difficulty, rest_seconds, description
                    from exercises order by array_position(${GROUPS}::text[], muscle_group), name`
    return { exercises }
  },
})
