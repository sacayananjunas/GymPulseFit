import { db } from './db.js'

// Today's workout for a user: prefers one that's still open, otherwise the latest completed one.
export async function findTodaysWorkout(userId, today) {
  const sql = db()
  const [workout] = await sql`
    select id, name, workout_date::text as workout_date, status, duration_minutes, started_at, completed_at
    from workouts
    where user_id = ${userId} and workout_date = ${today}::date
    order by (status <> 'completed') desc, id desc
    limit 1`
  if (!workout) return null

  const rows = await sql`
    select we.id as workout_exercise_id, we.order_index,
           e.id as exercise_id, e.name, e.muscle_group, e.sets, e.reps, e.difficulty, e.rest_seconds, e.description,
           coalesce(json_agg(json_build_object('id', s.id, 'set_number', s.set_number, 'completed', s.completed)
                    order by s.set_number) filter (where s.id is not null), '[]') as set_list
    from workout_exercises we
    join exercises e on e.id = we.exercise_id
    left join workout_sets s on s.workout_exercise_id = we.id
    where we.workout_id = ${workout.id}
    group by we.id, e.id
    order by we.order_index, we.id`

  return { ...workout, exercises: rows }
}

// Names a workout after its muscle groups, e.g. "Chest & Arms" or "Full Body".
export async function renameWorkout(workoutId) {
  const sql = db()
  await sql`
    update workouts w set name = coalesce((
      select case
        when count(distinct e.muscle_group) = 0 then null
        when count(distinct e.muscle_group) > 2 then 'Full Body'
        else string_agg(distinct e.muscle_group, ' & ') || ' Day'
      end
      from workout_exercises we join exercises e on e.id = we.exercise_id
      where we.workout_id = w.id
    ), 'Today''s Workout')
    where w.id = ${workoutId}`
}
