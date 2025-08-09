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
        sub_reps,
        sub_rep_work_duration,
        sub_rep_rest_duration,
        rest
    )
VALUES (
        @group_id::BIGINT,
        @variation_id::BIGINT,
        @interval_id::BIGINT,
        sqlc.narg(rpe),
        @sets::INT,
        sqlc.narg(reps),
        sqlc.narg(duration),
        sqlc.narg(sub_reps),
        sqlc.narg(sub_rep_work_duration),
        sqlc.narg(sub_rep_rest_duration),
        sqlc.narg(rest)
    ) RETURNING *;

-- name: IntervalExercisePrescriptions_DeleteOne :exec
DELETE FROM interval_exercise_prescriptions WHERE id = $1;

-- name: IntervalExercisePrescriptions_List :many
SELECT
    iep.id,
    iep.group_id,
    iep.exercise_variation_id,
    iep.plan_interval_id,
    iep.rpe,
    iep.sets,
    iep.reps,
    iep.duration,
    iep.sub_reps,
    iep.sub_rep_work_duration,
    iep.sub_rep_rest_duration,
    iep.rest
FROM
    interval_exercise_prescriptions iep
WHERE
    (iep.group_id = @group_id::BIGINT or @group_id::bigint = 0)
    AND (iep.id = @prescription_id::BIGINT or @prescription_id::bigint = 0)
    AND (iep.exercise_variation_id = @variation_id::BIGINT or @variation_id::bigint = 0)
    AND (iep.plan_interval_id = @interval_id::BIGINT or @interval_id::bigint = 0)
LIMIT @_limit::int
OFFSET @_offset::int;

-- name: IntervalExercisePrescriptions_ListWithDetails :many
SELECT
    iep.id,
    iep.group_id,
    iep.exercise_variation_id,
    iep.plan_interval_id,
    iep.rpe,
    iep.sets,
    iep.reps,
    iep.duration,
    iep.sub_reps,
    iep.sub_rep_work_duration,
    iep.sub_rep_rest_duration,
    iep.rest,
    -- Exercise Variation details
    ev.id as ev_id,
    ev.exercise_id as ev_exercise_id,
    ev.name as ev_name,
    -- Exercise details
    e.id as e_id,
    e.name as e_name,
    e.description as e_description,
    e.user_id as e_user_id,
    e.created_at as e_created_at,
    e.updated_at as e_updated_at,
    -- Exercise Variation Parameters
    evp.id as evp_id,
    evp.locked as evp_locked,
    -- Parameter Type details
    pt.id as pt_id,
    pt.name as pt_name,
    pt.data_type as pt_data_type,
    pt.default_unit as pt_default_unit,
    pt.min_value as pt_min_value,
    pt.max_value as pt_max_value
FROM
    interval_exercise_prescriptions iep
    JOIN exercise_variations ev ON iep.exercise_variation_id = ev.id
    JOIN exercises e ON ev.exercise_id = e.id
    LEFT JOIN exercise_variation_params evp ON ev.id = evp.exercise_variation_id
    LEFT JOIN parameter_types pt ON evp.parameter_type_id = pt.id
WHERE
    (iep.group_id = @group_id::BIGINT or @group_id::bigint = 0)
    AND (iep.id = @prescription_id::BIGINT or @prescription_id::bigint = 0)
    AND (iep.exercise_variation_id = @variation_id::BIGINT or @variation_id::bigint = 0)
    AND (iep.plan_interval_id = @interval_id::BIGINT or @interval_id::bigint = 0)
ORDER BY iep.id, evp.id
LIMIT @_limit::int
OFFSET @_offset::int;

-- name: IntervalExercisePrescription_DeleteByExerciseId :exec
DELETE FROM interval_exercise_prescriptions WHERE exercise_variation_id IN (SELECT id FROM exercise_variations WHERE exercise_id = @exercise_id::BIGINT);
