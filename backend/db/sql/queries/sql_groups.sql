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
    (groups.id = @group_id::BIGINT or @group_id::bigint = 0) 
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