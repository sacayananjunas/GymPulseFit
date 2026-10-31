// Small display helpers for workout data returned by the API.

const WORK_SECONDS_PER_SET = 40

export const estimateMinutes = (exercises) =>
  Math.max(1, Math.round(exercises.reduce((s, e) => s + e.sets * (WORK_SECONDS_PER_SET + e.rest_seconds), 0) / 60))

// Rough average for mixed strength/cardio training.
export const estimateKcal = (minutes) => Math.round((minutes || 0) * 8)

export const workoutGroups = (exercises) => [...new Set(exercises.map((e) => e.muscle_group))]
