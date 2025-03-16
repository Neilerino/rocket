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

-- name: Plans_DeleteById :one
DELETE FROM plans WHERE id = $1 RETURNING *;