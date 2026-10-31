// Sample data for screens not yet backed by the database (Progress, Classes, Profile extras, quotes).
// Exercises, workouts, stats and the dashboard come from /api.

export const user = {
  name: 'Alex Rivera',
  handle: '@alexlifts',
  avatar: 'https://i.pravatar.cc/240?img=12',
  membership: 'Pulse Elite',
  memberSince: 'March 2024',
  level: 27,
  xp: 7420,
  xpNext: 9000,
  streak: 12,
  bestStreak: 31,
  stats: { workouts: 218, hours: 164, prs: 23 },
}

export const muscleGroups = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']

export const strengthHistory = [
  { month: 'May', bench: 70, squat: 95, deadlift: 120 },
  { month: 'Jun', bench: 72.5, squat: 100, deadlift: 127.5 },
  { month: 'Jul', bench: 75, squat: 107.5, deadlift: 135 },
  { month: 'Aug', bench: 77.5, squat: 110, deadlift: 140 },
  { month: 'Sep', bench: 80, squat: 117.5, deadlift: 150 },
  { month: 'Oct', bench: 85, squat: 125, deadlift: 160 },
]

export const personalRecords = [
  { lift: 'Deadlift', value: 160, unit: 'kg', date: 'Oct 19', delta: '+10', tier: 'gold' },
  { lift: 'Back Squat', value: 125, unit: 'kg', date: 'Oct 12', delta: '+7.5', tier: 'gold' },
  { lift: 'Bench Press', value: 85, unit: 'kg', date: 'Oct 08', delta: '+5', tier: 'silver' },
  { lift: '5K Run', value: '22:41', unit: '', date: 'Sep 28', delta: '−0:48', tier: 'silver' },
  { lift: 'Pull-Ups', value: 18, unit: 'reps', date: 'Sep 15', delta: '+3', tier: 'bronze' },
  { lift: 'Plank', value: '3:30', unit: '', date: 'Aug 30', delta: '+0:40', tier: 'bronze' },
]

export const classTypes = {
  Yoga: { color: '#B987FF', icon: 'flower' },
  HIIT: { color: '#FF6B3D', icon: 'zap' },
  Spin: { color: '#22E4FF', icon: 'bike' },
  Boxing: { color: '#C6FF3D', icon: 'swords' },
}

export const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const classes = [
  { id: 'c1', day: 'Mon', time: '06:30', type: 'Spin', title: 'Sunrise Climb', coach: 'Maya Chen', duration: 45, spots: 4, capacity: 20 },
  { id: 'c2', day: 'Mon', time: '12:15', type: 'HIIT', title: 'Lunch Burner', coach: 'Diego Santos', duration: 30, spots: 9, capacity: 18 },
  { id: 'c3', day: 'Mon', time: '18:30', type: 'Yoga', title: 'Vinyasa Flow', coach: 'Priya Nair', duration: 60, spots: 0, capacity: 24 },
  { id: 'c4', day: 'Tue', time: '07:00', type: 'Boxing', title: 'Fight Club Basics', coach: 'Marcus Cole', duration: 50, spots: 6, capacity: 16 },
  { id: 'c5', day: 'Tue', time: '19:00', type: 'Spin', title: 'Neon Ride', coach: 'Maya Chen', duration: 45, spots: 2, capacity: 20 },
  { id: 'c6', day: 'Wed', time: '06:00', type: 'HIIT', title: 'Tabata Thunder', coach: 'Diego Santos', duration: 40, spots: 11, capacity: 18 },
  { id: 'c7', day: 'Wed', time: '17:45', type: 'Yoga', title: 'Mobility Reset', coach: 'Priya Nair', duration: 45, spots: 14, capacity: 24 },
  { id: 'c8', day: 'Thu', time: '07:00', type: 'Spin', title: 'Interval Sprint', coach: 'Leo Park', duration: 45, spots: 7, capacity: 20 },
  { id: 'c9', day: 'Thu', time: '18:00', type: 'Boxing', title: 'Power Combos', coach: 'Marcus Cole', duration: 60, spots: 3, capacity: 16 },
  { id: 'c10', day: 'Fri', time: '12:00', type: 'HIIT', title: 'Friday Finisher', coach: 'Diego Santos', duration: 30, spots: 5, capacity: 18 },
  { id: 'c11', day: 'Fri', time: '18:30', type: 'Yoga', title: 'Yin & Breath', coach: 'Priya Nair', duration: 60, spots: 10, capacity: 24 },
  { id: 'c12', day: 'Sat', time: '09:00', type: 'Boxing', title: 'Saturday Sparring', coach: 'Marcus Cole', duration: 75, spots: 1, capacity: 16 },
  { id: 'c13', day: 'Sat', time: '10:30', type: 'Spin', title: 'Weekend Warriors', coach: 'Leo Park', duration: 50, spots: 12, capacity: 20 },
]

export const achievements = [
  { id: 'a1', title: 'Iron Streak', desc: '30-day training streak', icon: 'flame', unlocked: true, color: '#FF6B3D' },
  { id: 'a2', title: 'Centurion', desc: '100 workouts logged', icon: 'dumbbell', unlocked: true, color: '#C6FF3D' },
  { id: 'a3', title: 'Early Bird', desc: '20 workouts before 7am', icon: 'sunrise', unlocked: true, color: '#FFD23D' },
  { id: 'a4', title: 'PR Machine', desc: 'Set 20 personal records', icon: 'trophy', unlocked: true, color: '#22E4FF' },
  { id: 'a5', title: 'Class Act', desc: 'Attend 25 group classes', icon: 'users', unlocked: true, color: '#B987FF' },
  { id: 'a6', title: 'Double Bodyweight', desc: 'Deadlift 2× bodyweight', icon: 'medal', unlocked: false, color: '#C6FF3D', progress: 0.82 },
  { id: 'a7', title: 'Marathoner', desc: 'Run 42 km in a month', icon: 'timer', unlocked: false, color: '#22E4FF', progress: 0.55 },
  { id: 'a8', title: 'Zen Master', desc: '50 yoga sessions', icon: 'flower', unlocked: false, color: '#B987FF', progress: 0.3 },
]

export const quotes = [
  { text: 'The only bad workout is the one that didn’t happen.', author: 'Unknown' },
  { text: 'Strength does not come from the body. It comes from the will.', author: 'Arnold Schwarzenegger' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
  { text: 'You don’t have to be extreme, just consistent.', author: 'Unknown' },
  { text: 'Sweat is just fat crying.', author: 'Gym wisdom' },
  { text: 'Success isn’t always about greatness. It’s about consistency.', author: 'Dwayne Johnson' },
  { text: 'Take care of your body. It’s the only place you have to live.', author: 'Jim Rohn' },
]

export const quoteOfTheDay = () => {
  const d = new Date()
  const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000)
  return quotes[dayOfYear % quotes.length]
}
