-- PulseFit schema. Idempotent: safe to run more than once.

create table if not exists users (
  id                    serial primary key,
  email                 text not null unique,
  password_hash         text not null,
  full_name             text not null,
  weekly_goal_workouts  integer not null default 4  check (weekly_goal_workouts between 1 and 14),
  weekly_goal_minutes   integer not null default 180 check (weekly_goal_minutes between 10 and 2000),
  created_at            timestamptz not null default now()
);

create table if not exists exercises (
  id            serial primary key,
  name          text not null unique,
  muscle_group  text not null check (muscle_group in ('Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio')),
  sets          integer not null check (sets between 1 and 20),
  reps          text not null,
  difficulty    text not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  rest_seconds  integer not null check (rest_seconds between 0 and 600),
  description   text not null default ''
);

create table if not exists workouts (
  id                serial primary key,
  user_id           integer not null references users(id) on delete cascade,
  name              text not null,
  workout_date      date not null,
  status            text not null default 'planned' check (status in ('planned', 'in_progress', 'completed')),
  duration_minutes  integer check (duration_minutes >= 0),
  started_at        timestamptz,
  completed_at      timestamptz
);

create table if not exists workout_exercises (
  id           serial primary key,
  workout_id   integer not null references workouts(id) on delete cascade,
  exercise_id  integer not null references exercises(id) on delete restrict,
  order_index  integer not null default 0,
  unique (workout_id, exercise_id)
);

create table if not exists workout_sets (
  id                   serial primary key,
  workout_exercise_id  integer not null references workout_exercises(id) on delete cascade,
  set_number           integer not null check (set_number >= 1),
  completed            boolean not null default false,
  completed_at         timestamptz,
  unique (workout_exercise_id, set_number)
);

create table if not exists classes (
  id                serial primary key,
  title             text not null,
  coach_name        text not null,
  start_time        timestamptz not null,
  duration_minutes  integer not null check (duration_minutes > 0),
  capacity          integer not null check (capacity > 0),
  intensity         text not null check (intensity in ('Low', 'Medium', 'High')),
  unique (title, start_time)
);

create index if not exists workouts_user_date_idx      on workouts (user_id, workout_date);
create index if not exists workouts_user_status_idx    on workouts (user_id, status);
create index if not exists workout_exercises_wk_idx    on workout_exercises (workout_id);
create index if not exists workout_exercises_ex_idx    on workout_exercises (exercise_id);
create index if not exists workout_sets_we_idx         on workout_sets (workout_exercise_id);
create index if not exists exercises_group_idx         on exercises (muscle_group);
create index if not exists classes_start_idx           on classes (start_time);
