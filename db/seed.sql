-- PulseFit sample data. Idempotent: exercises upsert by name, classes skip existing (title, start_time).

insert into exercises (name, muscle_group, sets, reps, difficulty, rest_seconds, description) values
  -- Chest
  ('Barbell Bench Press',      'Chest', 4, '6-8',      'Advanced',     120, 'Lower the bar to mid-chest with control, then drive it up explosively. Keep shoulder blades pinned.'),
  ('Incline Dumbbell Press',   'Chest', 3, '8-10',     'Intermediate',  90, 'Bench at 30 degrees. Press dumbbells up and slightly together to hit the upper chest.'),
  ('Tempo Push-Ups',           'Chest', 3, '15',       'Beginner',      60, 'Three seconds down, one second up. Keep your body in one straight line.'),
  ('Cable Crossover Fly',      'Chest', 3, '12',       'Intermediate',  60, 'Soft elbows, hug a big tree and squeeze the chest at the bottom of each rep.'),
  ('Weighted Chest Dips',      'Chest', 3, '8-10',     'Advanced',      90, 'Lean forward slightly to bias the chest. Lower until upper arms are parallel to the floor.'),
  -- Back
  ('Conventional Deadlift',    'Back',  5, '5',        'Advanced',     150, 'Brace hard, push the floor away and lock out with your glutes. Bar stays close to your legs.'),
  ('Weighted Pull-Ups',        'Back',  4, '6-8',      'Advanced',     120, 'Start from a dead hang and pull your chest towards the bar. No kipping.'),
  ('Seated Cable Row',         'Back',  3, '10-12',    'Beginner',      75, 'Sit tall, pull the handle to your belly button and squeeze the shoulder blades together.'),
  ('Lat Pulldown',             'Back',  3, '10-12',    'Beginner',      75, 'Pull the bar to your upper chest while keeping your torso still. Control the way up.'),
  ('Single-Arm Dumbbell Row',  'Back',  3, '10 / arm', 'Intermediate',  60, 'Brace on a bench and row the dumbbell to your hip, keeping your back flat.'),
  -- Legs
  ('Back Squat',               'Legs',  5, '5',        'Advanced',     150, 'Sit down between your hips, knees tracking over toes. Drive up through the whole foot.'),
  ('Romanian Deadlift',        'Legs',  4, '8',        'Intermediate', 120, 'Hinge at the hips with soft knees until you feel a deep hamstring stretch.'),
  ('Walking Lunges',           'Legs',  3, '12 / leg', 'Beginner',      60, 'Long steps, back knee kisses the floor, torso stays upright.'),
  ('Bulgarian Split Squat',    'Legs',  3, '10 / leg', 'Intermediate',  90, 'Rear foot on a bench. Lower straight down and push through the front heel.'),
  ('Leg Press',                'Legs',  4, '10-12',    'Beginner',      90, 'Feet shoulder-width on the platform. Lower until knees reach 90 degrees.'),
  -- Arms
  ('Incline Dumbbell Curl',    'Arms',  3, '10-12',    'Beginner',      60, 'Lie back on an incline bench and curl without letting the elbows drift forward.'),
  ('Parallel Bar Dips',        'Arms',  3, '8-12',     'Intermediate',  90, 'Stay upright to focus on triceps. Lock out fully at the top.'),
  ('EZ-Bar Skull Crushers',    'Arms',  3, '10',       'Intermediate',  75, 'Lower the bar towards your forehead, elbows pointing to the ceiling.'),
  ('Hammer Curls',             'Arms',  3, '12',       'Beginner',      60, 'Neutral grip, palms facing each other. Great for forearms and brachialis.'),
  ('Close-Grip Bench Press',   'Arms',  4, '6-8',      'Advanced',     120, 'Hands shoulder-width apart, elbows tucked. Heavy triceps builder.'),
  -- Core
  ('Weighted Plank',           'Core',  3, '45s',      'Beginner',      45, 'Plate on your upper back, squeeze glutes and keep hips level.'),
  ('Hanging Leg Raise',        'Core',  3, '12',       'Intermediate',  60, 'Hang from a bar and raise straight legs to hip height without swinging.'),
  ('Ab Wheel Rollout',         'Core',  3, '10',       'Advanced',      60, 'Roll out slowly, keep your lower back from sagging, then pull back with your abs.'),
  ('Dead Bug',                 'Core',  3, '10 / side','Beginner',      45, 'Lower back pressed into the floor while you extend opposite arm and leg.'),
  ('Cable Woodchopper',        'Core',  3, '12 / side','Intermediate',  60, 'Rotate through your torso, not your arms, from high to low.'),
  -- Cardio
  ('Rower Intervals',          'Cardio',6, '250m',     'Intermediate',  60, 'Legs, then body, then arms. Sprint each 250 m and recover between.'),
  ('Assault Bike Sprints',     'Cardio',8, '20s',      'Advanced',      40, 'All-out effort for 20 seconds. Push and pull with arms and legs.'),
  ('Jump Rope',                'Cardio',5, '60s',      'Beginner',      45, 'Stay light on the balls of your feet. Small, quick turns from the wrists.'),
  ('Treadmill Hill Walk',      'Cardio',3, '8 min',    'Beginner',      60, '10-12% incline at a brisk walking pace. No holding the rails.'),
  ('Burpee Ladder',            'Cardio',5, '10',       'Advanced',      60, 'Chest to floor, jump and clap overhead. Keep a steady rhythm.')
on conflict (name) do update set
  muscle_group = excluded.muscle_group,
  sets         = excluded.sets,
  reps         = excluded.reps,
  difficulty   = excluded.difficulty,
  rest_seconds = excluded.rest_seconds,
  description  = excluded.description;

-- 10 classes in the current week (Monday-based). Re-running in the same week adds nothing;
-- running it in a later week adds that week's schedule.
with week as (select date_trunc('week', now()) as monday)
insert into classes (title, coach_name, start_time, duration_minutes, capacity, intensity)
select c.title, c.coach, week.monday + c.at, c.duration, c.capacity, c.intensity
from week, (values
  ('Sunrise Spin',          'Maya Chen',     interval '0 days 06:30', 45, 20, 'High'),
  ('Vinyasa Flow Yoga',     'Priya Nair',    interval '0 days 18:30', 60, 24, 'Low'),
  ('HIIT Lunch Burner',     'Diego Santos',  interval '1 day 12:15',  30, 18, 'High'),
  ('Boxing Fundamentals',   'Marcus Cole',   interval '1 day 19:00',  50, 16, 'Medium'),
  ('Strength Foundations',  'Sam Okafor',    interval '2 days 07:00', 60, 12, 'Medium'),
  ('Mobility & Stretch',    'Priya Nair',    interval '2 days 17:45', 45, 24, 'Low'),
  ('Neon Night Ride',       'Leo Park',      interval '3 days 19:00', 45, 20, 'High'),
  ('Tabata Thunder HIIT',   'Diego Santos',  interval '4 days 12:00', 30, 18, 'High'),
  ('Power Combos Boxing',   'Marcus Cole',   interval '5 days 09:00', 60, 16, 'High'),
  ('Sunday Slow Yoga',      'Ava Lindqvist', interval '6 days 10:00', 60, 24, 'Low')
) as c(title, coach, at, duration, capacity, intensity)
on conflict (title, start_time) do nothing;
