-- name: ParameterTypes_GetById :one
SELECT * FROM parameter_types WHERE id = $1;

-- name: ParameterTypes_List :many
SELECT DISTINCT parameter_types.* FROM parameter_types 
LEFT JOIN user_parameter_types on parameter_types.id = user_parameter_types.parameter_type_id
WHERE (user_parameter_types.user_id = @user_id::BIGINT OR user_parameter_types.user_id IS NULL OR @user_id::bigint = 0)
AND (parameter_types.id = @parameter_type_id::BIGINT or @parameter_type_id::bigint = 0)
ORDER BY parameter_types.name DESC
LIMIT @_limit::int
OFFSET @_offset::int;

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


