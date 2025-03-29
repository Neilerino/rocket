-- name: ExerciseVariations_ListWithDetails :many
SELECT
    ev.id,
    ev.exercise_id,
    e.id as e_id,
    e.name as e_name,
    e.description as e_description,
    e.user_id as e_user_id,
    e.created_at as e_created_at,
    e.updated_at as e_updated_at,
    evp.id as evp_id,
    evp.parameter_type_id,
    evp.locked,
    pt.id as pt_id,
    pt.name as pt_name,
    pt.data_type as pt_data_type,
    pt.default_unit as pt_default_unit,
    pt.min_value as pt_min_value,
    pt.max_value as pt_max_value
FROM
    exercise_variations ev
    JOIN exercises e ON e.id = ev.exercise_id
    JOIN exercise_variation_params evp ON evp.exercise_variation_id = ev.id
    JOIN parameter_types pt ON pt.id = evp.parameter_type_id
    JOIN interval_exercise_prescriptions iep ON iep.exercise_variation_id = ev.id
    JOIN plan_intervals pi ON pi.id = iep.plan_interval_id
WHERE
    (ev.exercise_id = ANY(@exercise_id::BIGINT[]) or cardinality(@exercise_id::bigint[]) = 0) 
    AND (e.user_id = @user_id::BIGINT or @user_id::bigint = 0)
    AND (iep.group_id = ANY(@group_id::BIGINT[]) or cardinality(@group_id::bigint[]) = 0)
    AND (iep.plan_interval_id = ANY(@plan_interval_id::BIGINT[]) or cardinality(@plan_interval_id::bigint[]) = 0)
    AND (pi.plan_id = ANY(@plan_id::BIGINT[]) or cardinality(@plan_id::bigint[]) = 0)
    AND (ev.id = ANY(@variation_id::BIGINT[]) or cardinality(@variation_id::bigint[]) = 0)
ORDER BY e.created_at DESC -- Maybe come back and tweak this sort query a little bit
LIMIT @_limit::int
OFFSET @_offset::int;


-- name: ExerciseVariations_Create :one
INSERT INTO
    exercise_variations (exercise_id, name)
VALUES (@exercise_id::BIGINT, @name::TEXT) RETURNING *;


-- name: ExerciseVariations_AddParam :one
INSERT INTO
    exercise_variation_params (exercise_variation_id, parameter_type_id, locked)
VALUES (@exercise_variation_id::BIGINT, @parameter_type_id::BIGINT, @locked::BOOL) RETURNING *;