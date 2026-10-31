import { db } from '../../lib/db.js'
import { handler, body, intParam, HttpError } from '../../lib/http.js'
import { requireUser } from '../../lib/auth.js'

// PATCH /api/workouts/:id  { action: "start" | "complete" }
export default handler({
  async PATCH(req) {
    const userId = await requireUser(req)
    const id = intParam(req.query.id, 'workout id')
    const { action } = body(req)
    const sql = db()

    if (action === 'start') {
      const [w] = await sql`
        update workouts set status = 'in_progress', started_at = coalesce(started_at, now())
        where id = ${id} and user_id = ${userId} and status <> 'completed'
        returning id, status, started_at`
      if (!w) throw new HttpError(404, 'Workout not found or already finished.', 'NOT_FOUND')
      return { workout: w }
    }

    if (action === 'complete') {
      const [{ done }] = await sql`
        select count(*)::int as done
        from workout_sets s join workout_exercises we on we.id = s.workout_exercise_id
        join workouts w on w.id = we.workout_id
        where w.id = ${id} and w.user_id = ${userId} and s.completed`
      if (done === 0) throw new HttpError(400, 'Complete at least one set before finishing your workout.', 'NO_SETS')

      // Duration = time since the workout started (first set ticked), capped at 4 hours.
      const [w] = await sql`
        update workouts set
          status = 'completed',
          completed_at = now(),
          started_at = coalesce(started_at, now()),
          duration_minutes = least(240, greatest(1, round(extract(epoch from now() - coalesce(started_at, now())) / 60)))::int
        where id = ${id} and user_id = ${userId} and status <> 'completed'
        returning id, name, status, duration_minutes, started_at, completed_at`
      if (!w) throw new HttpError(404, 'Workout not found or already finished.', 'NOT_FOUND')
      return { workout: w, sets_completed: done }
    }

    throw new HttpError(400, 'Unknown action. Use "start" or "complete".', 'BAD_ACTION')
  },
})
