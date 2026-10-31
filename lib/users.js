export const USER_COLUMNS = 'id, email, full_name, weekly_goal_workouts, weekly_goal_minutes, created_at'

export const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  full_name: u.full_name,
  weekly_goal_workouts: u.weekly_goal_workouts,
  weekly_goal_minutes: u.weekly_goal_minutes,
  created_at: u.created_at,
})
