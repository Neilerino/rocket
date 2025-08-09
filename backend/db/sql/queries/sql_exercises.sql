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

-- name: Exercises_List :many
SELECT DISTINCT exercises.* FROM exercises
LEFT JOIN exercise_variations on exercise_variations.exercise_id = exercises.id
LEFT JOIN interval_exercise_prescriptions on exercise_variations.id = interval_exercise_prescriptions.exercise_variation_id
LEFT JOIN plan_intervals on plan_intervals.id = interval_exercise_prescriptions.plan_interval_id
WHERE
    (exercises.id = @exercise_id::BIGINT or @exercise_id::BIGINT = 0)
    AND (exercises.user_id = @user_id::BIGINT or @user_id::BIGINT = 0)
    AND (plan_intervals.plan_id = @plan_id::BIGINT or @plan_id::BIGINT = 0)
    AND (interval_exercise_prescriptions.group_id = @group_id::BIGINT or @group_id::BIGINT = 0)
    AND (plan_intervals.id = @interval_id::BIGINT or @interval_id::BIGINT = 0)
ORDER BY exercises.created_at DESC
LIMIT @_limit::int
OFFSET @_offset::int;

-- name: Exercises_GetByUserId :many
SELECT *
FROM exercises
WHERE
    user_id = $1
ORDER BY created_at
LIMIT $2;

-- name: Exercises_GetById :one
SELECT * FROM exercises WHERE id = $1 LIMIT 1;

-- name: Exercises_CreateOne :one
INSERT INTO
    exercises (name, description, user_id)
VALUES ($1, $2, $3) RETURNING *;

-- name: Exercises_UpdateOne :one
UPDATE exercises
SET
    name = $1,
    description = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE
    id = $3 RETURNING *;

-- name: Exercises_DeleteOne :exec
DELETE FROM exercises WHERE id = $1;

-- name: ExerciseVariations_DeleteOne :exec
DELETE FROM exercise_variations WHERE id = $1;
