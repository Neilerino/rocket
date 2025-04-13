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
