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