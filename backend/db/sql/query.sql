-- name: Plans_GetByUserId :many
SELECT *
FROM plans
WHERE
    user_id = $1
    AND (
        is_template = $2
        OR $3 = false
    )
    AND (
        is_public = $4
        OR $5 = false
    )
ORDER BY updated_at DESC
LIMIT $6
OFFSET
    $7;

-- name: Plans_GetByPlanId :one
SELECT * FROM plans WHERE id = $1 LIMIT 1;

-- name: Plans_CreateOne :one
INSERT INTO
    plans (
        name,
        description,
        user_id,
        is_template,
        is_public
    )
VALUES ($1, $2, $3, $4, $5) RETURNING *;

-- name: Plans_UpdateOne :one
UPDATE plans
SET
    name = $1,
    description = $2,
    is_template = $3,
    is_public = $4,
    updated_at = CURRENT_TIMESTAMP
WHERE
    id = $5 RETURNING *;

-- name: PlanIntervals_List :many
SELECT 
    pi.*,
    COALESCE(group_counts.count, 0) AS group_count
FROM plan_intervals pi
LEFT JOIN (
    SELECT 
        plan_interval_id, 
        COUNT(DISTINCT group_id) AS count
    FROM interval_group_assignments
    GROUP BY plan_interval_id
) AS group_counts ON pi.id = group_counts.plan_interval_id
WHERE
    (pi.plan_id = $1 OR $2 = 0) -- Filter by plan_id if provided (non-zero)
    AND (pi.id = $3 OR $4 = 0) -- Filter by interval_id if provided (non-zero)
ORDER BY pi."order"
LIMIT $5;

-- name: PlanIntervals_UpdateOrderByValues :many
UPDATE plan_intervals as p_i
SET
    "order" = v.new_orders[array_position(v.ids, p_i.id)]
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
        description,
        duration,
        "order"
    )
VALUES ($1, $2, $3, $4, $5) RETURNING *;

-- name: Plans_DeleteById :one
DELETE FROM plans WHERE id = $1 RETURNING *;

-- name: PlanIntervals_DeleteById :one
DELETE FROM plan_intervals WHERE id = $1 RETURNING *;

-- name: Groups_List :many
SELECT * from groups 
WHERE 
    (id = @group_id::BIGINT or @group_id::bigint = 0) 
ORDER BY created_at DESC
LIMIT @_limit::int
OFFSET @_offset::int;

-- name: GroupsJoinPlan_List :many
SELECT groups.* from groups 
JOIN interval_group_assignments on groups.id = interval_group_assignments.group_id AND (interval_group_assignments.plan_interval_id = @interval_id::BIGINT or @interval_id::bigint = 0)
JOIN plan_intervals on interval_group_assignments.plan_interval_id = plan_intervals.id AND (plan_intervals.plan_id = @plan_id::BIGINT or @plan_id::bigint = 0)
WHERE 
    (id = @group_id::BIGINT or @group_id::bigint = 0) 
ORDER BY groups.created_at DESC
LIMIT @_limit::int
OFFSET @_offset::int;

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
VALUES ($1, $2, $3) RETURNING *;

-- name: Groups_UpdateOne :one
UPDATE "groups"
SET
    name = $1,
    description = $2
WHERE
    id = $3 RETURNING *;

-- name: Groups_DeleteById :one
DELETE FROM groups WHERE id = $1 RETURNING *;

-- name: IntervalGroupAssignments_Create :one
INSERT INTO
    interval_group_assignments (
        plan_interval_id,
        group_id,
        frequency
    )
VALUES ($1, $2, $3) RETURNING *;

-- name: IntervalGroupAssignments_Delete :exec
DELETE FROM interval_group_assignments
WHERE
    plan_interval_id = $1
    AND group_id = $2;

-- name: IntervalGroupAssignments_GetByIntervalId :many
SELECT
    iga.*,
    g.id as g_id,
    g.name as g_name,
    g.description as g_description,
    g.user_id as g_user_id,
    g.created_at as g_created_at,
    g.updated_at as g_updated_at
FROM
    interval_group_assignments iga
    JOIN groups g ON g.id = iga.group_id
WHERE
    iga.plan_interval_id = $1;

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
FROM
    interval_group_assignments iga
    JOIN plan_intervals pi ON pi.id = iga.plan_interval_id
WHERE
    iga.group_id = $1;

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
FROM
    exercise_variations ev
    JOIN exercises e ON e.id = ev.exercise_id
    JOIN parameter_types pt ON pt.id = ev.parameter_type_id
WHERE
    ev.exercise_id = $1;

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
FROM
    exercise_variations ev
    JOIN exercises e ON e.id = ev.exercise_id
    JOIN parameter_types pt ON pt.id = ev.parameter_type_id
WHERE
    ev.id = $1;

-- name: ExerciseVariations_CreateOne :one
INSERT INTO
    exercise_variations (
        exercise_id,
        parameter_type_id
    )
VALUES ($1, $2) RETURNING *;

-- name: ExerciseVariations_DeleteOne :exec
DELETE FROM exercise_variations WHERE id = $1;

-- name: ParameterTypes_GetById :one
SELECT * FROM parameter_types WHERE id = $1;

-- name: ParameterTypes_CreateOne :one
INSERT INTO
    parameter_types (
        name,
        data_type,
        default_unit,
        min_value,
        max_value
    )
VALUES ($1, $2, $3, $4, $5) RETURNING *;

-- name: ExerciseVariations_CreateOneWithDetails :one
WITH
    created_variation AS (
        INSERT INTO
            exercise_variations (
                exercise_id,
                parameter_type_id
            )
        VALUES ($1, $2) RETURNING *
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
FROM
    created_variation ev
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
FROM
    interval_exercise_prescriptions iep
    JOIN exercise_variations ev ON ev.id = iep.exercise_variation_id
    JOIN exercises e ON e.id = ev.exercise_id
    JOIN parameter_types pt ON pt.id = ev.parameter_type_id
WHERE
    iep.group_id = $1;

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
FROM
    interval_exercise_prescriptions iep
    JOIN exercise_variations ev ON ev.id = iep.exercise_variation_id
    JOIN exercises e ON e.id = ev.exercise_id
    JOIN parameter_types pt ON pt.id = ev.parameter_type_id
WHERE
    iep.plan_interval_id = $1;

-- name: IntervalExercisePrescriptions_CreateOne :one
INSERT INTO
    interval_exercise_prescriptions (
        group_id,
        exercise_variation_id,
        plan_interval_id,
        rpe,
        sets,
        reps,
        duration,
        rest
    )
VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
    ) RETURNING *;

-- name: IntervalExercisePrescriptions_DeleteOne :exec
DELETE FROM interval_exercise_prescriptions WHERE id = $1;