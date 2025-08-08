-- Test Data Fixtures for Integration Testing
-- This file provides comprehensive test data covering all API scenarios

-- =====================================
-- USERS
-- =====================================
-- Two test users for authorization testing
INSERT INTO users (id, email, first_name, last_name, created_at, updated_at) VALUES
(1, 'test1@example.com', 'Test', 'User1', '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
(2, 'test2@example.com', 'Test', 'User2', '2024-01-01 10:00:00', '2024-01-01 10:00:00');

-- =====================================
-- PARAMETER TYPES
-- =====================================
-- Global parameter types (no user_id constraint)
INSERT INTO parameter_types (id, name, data_type, default_unit, min_value, max_value) VALUES
(1, 'Weight', 'weight', 'kg', 0, 1000),
(2, 'Reps', 'count', 'reps', 1, 999),
(3, 'Duration', 'time', 'seconds', 1, 7200),
(4, 'Distance', 'length', 'meters', 0, 10000),
(5, 'Percentage', 'percentage', '%', 0, 100);

-- =====================================
-- PLANS
-- =====================================
-- Plans covering all filter combinations for testing
INSERT INTO plans (id, name, description, user_id, is_template, is_public, created_at, updated_at) VALUES
-- User 1 plans (4 total - covers all template/public combinations)
(1, 'User1 Regular Plan', 'A regular workout plan for user 1', 1, false, false, '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
(2, 'User1 Template Plan', 'A template plan for user 1', 1, true, false, '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
(3, 'User1 Public Plan', 'A public plan for user 1', 1, false, true, '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
(4, 'User1 Public Template', 'A public template for user 1', 1, true, true, '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
-- User 2 plans (1 total - for user isolation testing)
(5, 'User2 Plan', 'A plan for user 2', 2, false, false, '2024-01-01 10:00:00', '2024-01-01 10:00:00');

-- =====================================
-- PLAN INTERVALS
-- =====================================
-- Intervals for testing plan relationships and aggregation
INSERT INTO plan_intervals (id, plan_id, name, description, duration, "order", created_at, updated_at) VALUES
-- Plan 1 intervals
(1, 1, 'Week 1', 'First week of regular plan', '1 week', 1, '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
(2, 1, 'Week 2', 'Second week of regular plan', '1 week', 2, '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
-- Plan 2 intervals
(3, 2, 'Template Week 1', 'First week of template plan', '1 week', 1, '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
-- Plan 5 intervals (user 2)
(4, 5, 'User2 Week 1', 'First week for user 2', '1 week', 1, '2024-01-01 10:00:00', '2024-01-01 10:00:00');

-- =====================================
-- EXERCISES
-- =====================================
-- Exercises for testing exercise APIs and relationships
INSERT INTO exercises (id, name, description, user_id, created_at, updated_at) VALUES
-- User 1 exercises
(1, 'Push-ups', 'Basic push-up exercise for upper body strength', 1, '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
(2, 'Squats', 'Basic squat exercise for lower body strength', 1, '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
(3, 'Plank', 'Core stability exercise', 1, '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
-- User 2 exercises (for user isolation testing)
(4, 'User2 Push-ups', 'Push-ups for user 2', 2, '2024-01-01 10:00:00', '2024-01-01 10:00:00');

-- =====================================
-- EXERCISE VARIATIONS
-- =====================================
-- Variations for testing complex aggregated queries
INSERT INTO exercise_variations (id, exercise_id, name) VALUES
-- Push-up variations
(1, 1, 'Standard Push-up'),
(2, 1, 'Incline Push-up'),
-- Squat variations
(3, 2, 'Bodyweight Squat'),
(4, 2, 'Goblet Squat'),
-- Plank variation
(5, 3, 'Standard Plank'),
-- User 2 variation
(6, 4, 'User2 Standard Push-up');

-- =====================================
-- EXERCISE VARIATION PARAMETERS
-- =====================================
-- Parameters for testing complex nested data
INSERT INTO exercise_variation_params (id, exercise_variation_id, parameter_type_id, locked) VALUES
-- Push-up parameters
(1, 1, 2, false), -- reps
(2, 1, 3, false), -- duration
-- Squat parameters  
(3, 3, 2, false), -- reps
(4, 4, 1, false), -- weight (for goblet squat)
(5, 4, 2, false), -- reps
-- Plank parameters
(6, 5, 3, true);  -- duration (locked)

-- =====================================
-- GROUPS
-- =====================================
-- Exercise groups for testing group APIs and relationships
INSERT INTO groups (id, name, description, user_id, created_at, updated_at) VALUES
-- User 1 groups
(1, 'Upper Body', 'Upper body exercise group', 1, '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
(2, 'Lower Body', 'Lower body exercise group', 1, '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
(3, 'Core', 'Core exercise group', 1, '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
-- User 2 groups (for user isolation testing)
(4, 'User2 Upper Body', 'Upper body group for user 2', 2, '2024-01-01 10:00:00', '2024-01-01 10:00:00');

-- =====================================
-- INTERVAL GROUP ASSIGNMENTS
-- =====================================
-- Assignments for testing interval-group relationships
INSERT INTO interval_group_assignments (id, plan_interval_id, group_id, frequency) VALUES
-- Week 1 assignments (plan 1, interval 1)
(1, 1, 1, 3), -- Upper body 3x per week
(2, 1, 2, 2), -- Lower body 2x per week
-- Week 2 assignments (plan 1, interval 2)
(3, 2, 1, 2), -- Upper body 2x per week
(4, 2, 3, 1), -- Core 1x per week
-- Template plan assignments (plan 2, interval 3)
(5, 3, 1, 4), -- Upper body 4x per week
-- User 2 assignments (plan 5, interval 4)
(6, 4, 4, 2); -- User2 upper body 2x per week

-- =====================================
-- INTERVAL EXERCISE PRESCRIPTIONS
-- =====================================
-- Complex prescriptions for testing aggregated APIs
INSERT INTO interval_exercise_prescriptions (
    id, group_id, exercise_variation_id, plan_interval_id, 
    rpe, sets, reps, duration, sub_reps, sub_rep_work_duration, sub_rep_rest_duration, rest
) VALUES
-- Upper body prescriptions (group 1, interval 1)
(1, 1, 1, 1, 8, 3, 12, NULL, NULL, NULL, NULL, '00:01:30'::INTERVAL), -- Standard push-ups
(2, 1, 2, 1, 6, 3, 15, NULL, NULL, NULL, NULL, '00:01:30'::INTERVAL), -- Incline push-ups

-- Lower body prescriptions (group 2, interval 1)  
(3, 2, 3, 1, 7, 4, 15, NULL, NULL, NULL, NULL, '00:02:00'::INTERVAL), -- Bodyweight squats
(4, 2, 4, 1, 8, 3, 12, NULL, NULL, NULL, NULL, '00:02:00'::INTERVAL), -- Goblet squats

-- Upper body prescriptions (group 1, interval 2)
(5, 1, 1, 2, 9, 4, 10, NULL, NULL, NULL, NULL, '00:01:30'::INTERVAL), -- Standard push-ups (progression)

-- Core prescriptions (group 3, interval 2)
(6, 3, 5, 2, 7, 3, NULL, '00:00:45'::INTERVAL, NULL, NULL, NULL, '00:01:00'::INTERVAL), -- Plank hold

-- Template plan prescriptions (group 1, interval 3)
(7, 1, 1, 3, 8, 5, 8, NULL, NULL, NULL, NULL, '00:01:45'::INTERVAL), -- Template push-ups

-- User 2 prescriptions (group 4, interval 4)
(8, 4, 6, 4, 7, 3, 10, NULL, NULL, NULL, NULL, '00:01:30'::INTERVAL); -- User2 push-ups

-- =====================================
-- RESET SEQUENCE VALUES
-- =====================================
-- Ensure sequence values are set correctly for future insertions
SELECT setval('users_id_seq', 2);
SELECT setval('parameter_types_id_seq', 5);
SELECT setval('plans_id_seq', 5);
SELECT setval('plan_intervals_id_seq', 4);
SELECT setval('exercises_id_seq', 4);
SELECT setval('exercise_variations_id_seq', 6);
SELECT setval('exercise_variation_params_id_seq', 6);
SELECT setval('groups_id_seq', 4);
SELECT setval('interval_group_assignments_id_seq', 6);
SELECT setval('interval_exercise_prescriptions_id_seq', 8);

-- =====================================
-- VERIFICATION QUERIES (for debugging)
-- =====================================
-- These can be used to verify data was inserted correctly

-- Verify user data
-- SELECT id, email, first_name, last_name FROM users ORDER BY id;

-- Verify plan filter combinations
-- SELECT id, name, user_id, is_template, is_public FROM plans ORDER BY id;

-- Verify complex relationships (prescriptions with variations)
-- SELECT 
--     iep.id,
--     g.name as group_name,
--     ev.name as variation_name,
--     e.name as exercise_name,
--     iep.sets,
--     iep.reps,
--     iep.duration
-- FROM interval_exercise_prescriptions iep
-- JOIN groups g ON iep.group_id = g.id
-- JOIN exercise_variations ev ON iep.exercise_variation_id = ev.id  
-- JOIN exercises e ON ev.exercise_id = e.id
-- ORDER BY iep.id;