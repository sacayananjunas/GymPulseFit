import { db } from '../lib/db.js'
import { handler, HttpError } from '../lib/http.js'
import { requireUser } from '../lib/auth.js'
import { timezone, localDate, addDays, weekStart, weekdayShort } from '../lib/time.js'
import { findTodaysWorkout } from '../lib/workouts.js'

function streaks(datesDesc, today) {
  const set = new Set(datesDesc)
  // A streak stays alive until the end of today even if you haven't trained yet today.
  let cursor = set.has(today) ? today : addDays(today, -1)
  let current = 0
  while (set.has(cursor)) {
    current++
    cursor = addDays(cursor, -1)
  }
  let best = 0
  let run = 0
  let prev = null
  for (const d of [...datesDesc].reverse()) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1
    best = Math.max(best, run)
    prev = d
  }
  return { current, best }
}

export default handler({
  async GET(req) {
    const userId = await requireUser(req)
    const today = localDate(timezone(req))
    const monday = weekStart(today)
    const sql = db()

    const [[user], todaysWorkout, daily, dates, [week], upcoming] = await Promise.all([
      sql`select full_name, weekly_goal_workouts, weekly_goal_minutes from users where id = ${userId}`,
      findTodaysWorkout(userId, today),
      sql`
        select d::date::text as day,
               coalesce(sum(w.duration_minutes), 0)::int as minutes,
               count(w.id)::int as workouts
        from generate_series(${today}::date - 13, ${today}::date, interval '1 day') as d
        left join workouts w
          on w.user_id = ${userId} and w.status = 'completed' and w.workout_date = d::date
        group by d order by d`,
      sql`
        select distinct workout_date::text as d from workouts
        where user_id = ${userId} and status = 'completed'
        order by d desc limit 1000`,
      sql`
        select count(*)::int as workouts, coalesce(sum(duration_minutes), 0)::int as minutes
        from workouts
        where user_id = ${userId} and status = 'completed'
          and workout_date between ${monday}::date and ${today}::date`,
      sql`
        select id, title, coach_name, start_time, duration_minutes, capacity, intensity
        from classes where start_time >= now() order by start_time limit 3`,
    ])
    if (!user) throw new HttpError(401, 'Please log in to continue.', 'UNAUTHENTICATED')

    const completedDates = dates.map((r) => r.d)
    const last7 = daily.slice(7)
    const prev7Minutes = daily.slice(0, 7).reduce((s, d) => s + d.minutes, 0)
    const last7Minutes = last7.reduce((s, d) => s + d.minutes, 0)
    const completedToday = completedDates.includes(today)

    const goals = [
      week.workouts >= user.weekly_goal_workouts,
      week.minutes >= user.weekly_goal_minutes,
      completedToday,
    ]

    return {
      today,
      user: { full_name: user.full_name },
      todays_workout: todaysWorkout,
      completed_today: completedToday,
      activity: last7.map((d) => ({ date: d.day, day: weekdayShort(d.day), minutes: d.minutes, workouts: d.workouts })),
      activity_total: last7Minutes,
      activity_change_pct: prev7Minutes > 0 ? Math.round(((last7Minutes - prev7Minutes) / prev7Minutes) * 100) : null,
      streak: {
        ...streaks(completedDates, today),
        week: Array.from({ length: 7 }, (_, i) => {
          const d = addDays(monday, i)
          return { date: d, day: weekdayShort(d).slice(0, 1), done: completedDates.includes(d), future: d > today }
        }),
      },
      rings: {
        workouts: { value: week.workouts, goal: user.weekly_goal_workouts },
        minutes: { value: week.minutes, goal: user.weekly_goal_minutes },
        goals: { value: goals.filter(Boolean).length, goal: goals.length },
      },
      upcoming_classes: upcoming,
    }
  },
})
