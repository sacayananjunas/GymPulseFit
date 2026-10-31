import { db } from '../../lib/db.js'
import { handler, body, intParam, HttpError } from '../../lib/http.js'
import { requireUser } from '../../lib/auth.js'
import { timezone, localDate } from '../../lib/time.js'
import { findTodaysWorkout, renameWorkout } from '../../lib/workouts.js'

// The open (not yet completed) workout for today, created on demand.
async function openWorkoutId(userId, today, create) {
  const sql = db()
  const [open] = await sql`
    select id from workouts
    where user_id = ${userId} and workout_date = ${today}::date and status <> 'completed'
    order by id desc limit 1`
  if (open || !create) return open?.id ?? null
  const [created] = await sql`
    insert into workouts (user_id, name, workout_date) values (${userId}, 'Today''s Workout', ${today}::date)
    returning id`
  return created.id
}

export default handler({
  // Today's workout with exercises and sets.
  async GET(req) {
    const userId = await requireUser(req)
    const today = localDate(timezone(req))
    return { today, workout: await findTodaysWorkout(userId, today) }
  },

  // Add an exercise (and its sets) to today's open workout.
  async POST(req, res) {
    const userId = await requireUser(req)
    const exerciseId = intParam(body(req).exercise_id, 'exercise_id')
    const today = localDate(timezone(req))
    const sql = db()

    const [exercise] = await sql`select id, name from exercises where id = ${exerciseId}`
    if (!exercise) throw new HttpError(404, 'That exercise no longer exists.', 'NOT_FOUND')

    const workoutId = await openWorkoutId(userId, today, true)
    const added = await sql`
      with we as (
        insert into workout_exercises (workout_id, exercise_id, order_index)
        values (${workoutId}, ${exerciseId},
                (select coalesce(max(order_index) + 1, 0) from workout_exercises where workout_id = ${workoutId}))
        on conflict (workout_id, exercise_id) do nothing
        returning id
      )
      insert into workout_sets (workout_exercise_id, set_number)
      select we.id, n from we, exercises e, generate_series(1, e.sets) as n
      where e.id = ${exerciseId}
      returning workout_exercise_id`
    if (added.length) await renameWorkout(workoutId)

    res.status(added.length ? 201 : 200)
    return { workout: await findTodaysWorkout(userId, today), added: added.length > 0, exercise_name: exercise.name }
  },

  // Remove an exercise from today's open workout: DELETE /api/workouts/today?exercise_id=12
  async DELETE(req) {
    const userId = await requireUser(req)
    const exerciseId = intParam(req.query.exercise_id, 'exercise_id')
    const today = localDate(timezone(req))
    const workoutId = await openWorkoutId(userId, today, false)
    if (!workoutId) throw new HttpError(404, 'There’s no open workout today.', 'NOT_FOUND')

    const sql = db()
    await sql`delete from workout_exercises where workout_id = ${workoutId} and exercise_id = ${exerciseId}`
    const [{ remaining }] = await sql`select count(*)::int as remaining from workout_exercises where workout_id = ${workoutId}`
    if (remaining === 0) await sql`delete from workouts where id = ${workoutId} and user_id = ${userId} and status = 'planned'`
    else await renameWorkout(workoutId)

    return { workout: await findTodaysWorkout(userId, today) }
  },
})
