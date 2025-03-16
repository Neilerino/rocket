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

-- name: PlanIntervals_DeleteById :one
DELETE FROM plan_intervals WHERE id = $1 RETURNING *;