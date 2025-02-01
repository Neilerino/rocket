-- name: Plans_GetByUserId :many
SELECT * FROM plans WHERE user_id = $1 ORDER BY created_at LIMIT $2;

-- name: Plans_CreateOne :one
INSERT INTO
    plans (name, description, user_id)
VALUES ($1, $2, $3)
RETURNING
    *;

-- name: PlanIntervals_GetByPlanId :many
SELECT *
FROM plan_intervals
WHERE
    plan_id = $1
order by "order"
limit $2;

-- name: PlanIntervals_UpdateOrderByValues :many
UPDATE plan_intervals as p_i
SET
    "order" = v.new_order
FROM (
        VALUES (
                sqlc.arg ('interval_ids')::bigint[], sqlc.arg ('new_orders')::int[]
            )
    ) AS v (ids, new_orders)
WHERE
    p_i.id = ANY (v.ids)
RETURNING
    *;

-- name: PlanIntervals_CreateOne :one
INSERT INTO
    plan_intervals (
        plan_id,
        name,
        duration,
        "order"
    )
VALUES ($1, $2, $3, $4)
RETURNING
    *;

-- name: PlanIntervals_DeleteById :one
DELETE FROM plan_intervals WHERE id = $1 RETURNING *;

-- name: Groups_GetByUserId :many
SELECT * FROM groups WHERE user_id = $1 ORDER BY created_at LIMIT $2;

-- name: Groups_GetByPlanId :many
SELECT g.id, g.name, g.description, g.user_id, g.created_at, g.updated_at, iga.frequency, pi."order" as interval_order
FROM
    "groups" g
    JOIN interval_group_assignments iga on iga.group_id = g.id
    JOIN plan_intervals pi on pi.id = iga.plan_interval_id
    and pi.plan_id = $1
ORDER BY pi."order"
LIMIT $2;

-- name: Groups_CreateOne :one
INSERT INTO
    groups (name, description, user_id)
VALUES ($1, $2, $3)
RETURNING
    *;

-- name: Groups_UpdateOne :one
UPDATE "groups"
SET
    name = $1,
    description = $2
WHERE
    id = $3
RETURNING
    *;

-- name: Groups_DeleteById :one
DELETE FROM groups WHERE id = $1 RETURNING *;

-- name: IntervalGroupAssignment_CreateOne :one
INSERT INTO
    interval_group_assignments (
        plan_interval_id,
        group_id,
        frequency
    )
VALUES ($1, $2, $3)
RETURNING
    *;

-- name: IntervalGroupAssignment_DeleteByKey :one
DELETE FROM interval_group_assignments
WHERE
    plan_interval_id = $1
    AND group_id = $2
RETURNING
    *;

-- name: Exercises_GetByPlanId :many
SELECT exercises.id, exercises.name, exercises.description, exercises.user_id, exercises.created_at, exercises.updated_at
FROM
    exercises
    JOIN exercise_variations on exercise_variations.exercise_id = exercises.id
    JOIN interval_exercise_prescriptions on exercise_variations.id = interval_exercise_prescriptions.exercise_variation_id
    JOIN plan_intervals on plan_intervals.id = interval_exercise_prescriptions.plan_interval_id
WHERE
    plan_intervals.plan_id = $1
ORDER BY plan_intervals."order"
LIMIT $2;

-- name: Exercises_CreateOne :one
INSERT INTO
    exercises (name, description, user_id)
VALUES ($1, $2, $3)
RETURNING
    *;

-- name: Exercises_UpdateOne :one
UPDATE exercises
SET
    name = $1,
    description = $2
WHERE
    id = $3
RETURNING
    *;

-- name: Exercises_DeleteById :one
DELETE FROM exercises WHERE id = $1 RETURNING *;

-- name: ExerciseVariations_GetByExerciseId :many
SELECT * FROM exercise_variations WHERE exercise_id = $1;

-- name: ExerciseVariations_CreateOne :one
INSERT INTO
    exercise_variations (exercise_id, parameter_type_id)
VALUES ($1, $2)
RETURNING
    *;

-- name: ExerciseVariations_DeleteById :one
DELETE FROM exercise_variations WHERE id = $1 RETURNING *;

-- name: IntervalExercisePrescriptions_CreateOne :one
INSERT INTO
    interval_exercise_prescriptions (group_id, exercise_variation_id, plan_interval_id, rpe, sets, reps, duration, rest)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING
    *;

-- name: IntervalExercisePrescriptions_DeleteById :one
DELETE FROM interval_exercise_prescriptions WHERE id = $1 RETURNING *;


