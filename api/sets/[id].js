import { db } from '../../lib/db.js'
import { handler, body, intParam, HttpError } from '../../lib/http.js'
import { requireUser } from '../../lib/auth.js'

// PATCH /api/sets/:id  { completed: boolean } — only for sets in the user's own, unfinished workouts.
export default handler({
  async PATCH(req) {
    const userId = await requireUser(req)
    const id = intParam(req.query.id, 'set id')
    const { completed } = body(req)
    if (typeof completed !== 'boolean') throw new HttpError(400, '"completed" must be true or false.', 'BAD_REQUEST')

    const [set] = await db()`
      with upd as (
        update workout_sets s
        set completed = ${completed}::boolean, completed_at = case when ${completed}::boolean then now() else null end
        from workout_exercises we, workouts w
        where s.id = ${id} and we.id = s.workout_exercise_id and w.id = we.workout_id
          and w.user_id = ${userId} and w.status <> 'completed'
        returning s.id, s.completed, w.id as workout_id, w.started_at
      ),
      started as (
        update workouts set status = 'in_progress', started_at = coalesce(started_at, now())
        where id in (select workout_id from upd) and status = 'planned'
        returning started_at
      )
      select upd.id, upd.completed, upd.workout_id,
             coalesce((select started_at from started), upd.started_at) as started_at
      from upd`
    if (!set) throw new HttpError(404, 'That set wasn’t found in an active workout.', 'NOT_FOUND')
    return { set }
  },
})
