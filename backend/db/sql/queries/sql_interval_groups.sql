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