-- name: Plans_GetByUserId :many
SELECT * FROM plans WHERE user_id = $1 ORDER BY created_at LIMIT $2;

-- name: Plans_GetByPlanId :one
SELECT * FROM plans WHERE id = $1 LIMIT 1;

-- name: Plans_CreateOne :one
INSERT INTO
    plans (name, description, user_id)
VALUES ($1, $2, $3)
RETURNING
    *;

-- name: Plans_UpdateOne :one
UPDATE plans 
SET 
    name = $1,
    description = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $3 
RETURNING *;

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

-- name: Plans_DeleteById :one
DELETE FROM plans WHERE id = $1 RETURNING *;


-- name: PlanIntervals_DeleteById :one
DELETE FROM plan_intervals WHERE id = $1 RETURNING *;

-- name: Groups_GetByUserId :many
SELECT * FROM groups WHERE user_id = $1 ORDER BY created_at LIMIT $2;

-- name: Groups_GetById :one
SELECT * FROM groups WHERE id = $1 LIMIT 1;

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

-- name: IntervalGroupAssignments_Create :one
INSERT INTO interval_group_assignments (
    plan_interval_id,
    group_id,
    frequency
) VALUES (
    $1, $2, $3
) RETURNING *;

-- name: IntervalGroupAssignments_Delete :exec
DELETE FROM interval_group_assignments 
WHERE plan_interval_id = $1 AND group_id = $2;

-- name: IntervalGroupAssignments_GetByIntervalId :many
SELECT 
    iga.*,
    g.id as g_id,
    g.name as g_name,
    g.description as g_description,
    g.user_id as g_user_id,
    g.created_at as g_created_at,
    g.updated_at as g_updated_at
FROM interval_group_assignments iga
JOIN groups g ON g.id = iga.group_id
WHERE iga.plan_interval_id = $1;

-- name: IntervalGroupAssignments_GetByGroupId :many
SELECT 
    iga.*,
    pi.id as pi_id,
    pi.plan_id as pi_plan_id,
    pi.name as pi_name,
    pi.duration as pi_duration,
    pi.order as pi_order,
    pi.created_at as pi_created_at,
    pi.updated_at as pi_updated_at
FROM interval_group_assignments iga
JOIN plan_intervals pi ON pi.id = iga.plan_interval_id
WHERE iga.group_id = $1;

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

-- name: Exercises_GetByUserId :many
SELECT * FROM exercises 
WHERE user_id = $1 
ORDER BY created_at 
LIMIT $2;

-- name: Exercises_GetById :one
SELECT * FROM exercises 
WHERE id = $1 
LIMIT 1;

-- name: Exercises_CreateOne :one
INSERT INTO exercises (
    name, 
    description, 
    user_id
) VALUES (
    $1, $2, $3
) RETURNING *;

-- name: Exercises_UpdateOne :one
UPDATE exercises 
SET 
    name = $1,
    description = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $3 
RETURNING *;

-- name: Exercises_DeleteOne :exec
DELETE FROM exercises 
WHERE id = $1;

-- name: ExerciseVariations_GetByExerciseIdWithDetails :many
SELECT 
    ev.id,
    ev.exercise_id,
    ev.parameter_type_id,
    e.id as e_id,
    e.name as e_name,
    e.description as e_description,
    e.user_id as e_user_id,
    e.created_at as e_created_at,
    e.updated_at as e_updated_at,
    pt.id as pt_id,
    pt.name as pt_name,
    pt.data_type as pt_data_type,
    pt.default_unit as pt_default_unit,
    pt.min_value as pt_min_value,
    pt.max_value as pt_max_value
FROM exercise_variations ev
JOIN exercises e ON e.id = ev.exercise_id
JOIN parameter_types pt ON pt.id = ev.parameter_type_id
WHERE ev.exercise_id = $1;

-- name: ExerciseVariations_GetByIdWithDetails :one
SELECT 
    ev.id,
    ev.exercise_id,
    ev.parameter_type_id,
    e.id as e_id,
    e.name as e_name,
    e.description as e_description,
    e.user_id as e_user_id,
    e.created_at as e_created_at,
    e.updated_at as e_updated_at,
    pt.id as pt_id,
    pt.name as pt_name,
    pt.data_type as pt_data_type,
    pt.default_unit as pt_default_unit,
    pt.min_value as pt_min_value,
    pt.max_value as pt_max_value
FROM exercise_variations ev
JOIN exercises e ON e.id = ev.exercise_id
JOIN parameter_types pt ON pt.id = ev.parameter_type_id
WHERE ev.id = $1;

-- name: ExerciseVariations_CreateOne :one
INSERT INTO exercise_variations (
    exercise_id,
    parameter_type_id
) VALUES (
    $1, $2
) RETURNING *;

-- name: ExerciseVariations_DeleteOne :exec
DELETE FROM exercise_variations 
WHERE id = $1;

-- name: ParameterTypes_GetById :one
SELECT * FROM parameter_types 
WHERE id = $1;

-- name: ParameterTypes_CreateOne :one
INSERT INTO parameter_types (
    name,
    data_type,
    default_unit,
    min_value,
    max_value
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: ExerciseVariations_CreateOneWithDetails :one
WITH created_variation AS (
    INSERT INTO exercise_variations (
        exercise_id,
        parameter_type_id
    ) VALUES (
        $1, $2
    ) RETURNING *
)
SELECT 
    ev.id,
    ev.exercise_id,
    ev.parameter_type_id,
    e.id as e_id,
    e.name as e_name,
    e.description as e_description,
    e.user_id as e_user_id,
    e.created_at as e_created_at,
    e.updated_at as e_updated_at,
    pt.id as pt_id,
    pt.name as pt_name,
    pt.data_type as pt_data_type,
    pt.default_unit as pt_default_unit,
    pt.min_value as pt_min_value,
    pt.max_value as pt_max_value
FROM created_variation ev
JOIN exercises e ON e.id = ev.exercise_id
JOIN parameter_types pt ON pt.id = ev.parameter_type_id;

-- name: IntervalExercisePrescriptions_GetByGroupId :many
SELECT 
    iep.id,
    iep.group_id,
    iep.exercise_variation_id,
    iep.plan_interval_id,
    iep.rpe,
    iep.sets,
    iep.reps,
    iep.duration,
    iep.rest,
    ev.id as ev_id,
    ev.exercise_id as ev_exercise_id,
    ev.parameter_type_id as ev_parameter_type_id,
    e.id as e_id,
    e.name as e_name,
    e.description as e_description,
    e.user_id as e_user_id,
    e.created_at as e_created_at,
    e.updated_at as e_updated_at,
    pt.id as pt_id,
    pt.name as pt_name,
    pt.data_type as pt_data_type,
    pt.default_unit as pt_default_unit,
    pt.min_value as pt_min_value,
    pt.max_value as pt_max_value
FROM interval_exercise_prescriptions iep
JOIN exercise_variations ev ON ev.id = iep.exercise_variation_id
JOIN exercises e ON e.id = ev.exercise_id
JOIN parameter_types pt ON pt.id = ev.parameter_type_id
WHERE iep.group_id = $1;

-- name: IntervalExercisePrescriptions_GetByPlanIntervalId :many
SELECT 
    iep.id,
    iep.group_id,
    iep.exercise_variation_id,
    iep.plan_interval_id,
    iep.rpe,
    iep.sets,
    iep.reps,
    iep.duration,
    iep.rest,
    ev.id as ev_id,
    ev.exercise_id as ev_exercise_id,
    ev.parameter_type_id as ev_parameter_type_id,
    e.id as e_id,
    e.name as e_name,
    e.description as e_description,
    e.user_id as e_user_id,
    e.created_at as e_created_at,
    e.updated_at as e_updated_at,
    pt.id as pt_id,
    pt.name as pt_name,
    pt.data_type as pt_data_type,
    pt.default_unit as pt_default_unit,
    pt.min_value as pt_min_value,
    pt.max_value as pt_max_value
FROM interval_exercise_prescriptions iep
JOIN exercise_variations ev ON ev.id = iep.exercise_variation_id
JOIN exercises e ON e.id = ev.exercise_id
JOIN parameter_types pt ON pt.id = ev.parameter_type_id
WHERE iep.plan_interval_id = $1;

-- name: IntervalExercisePrescriptions_CreateOne :one
INSERT INTO interval_exercise_prescriptions (
    group_id,
    exercise_variation_id,
    plan_interval_id,
    rpe,
    sets,
    reps,
    duration,
    rest
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
) RETURNING *;

-- name: IntervalExercisePrescriptions_DeleteOne :exec
DELETE FROM interval_exercise_prescriptions WHERE id = $1;
