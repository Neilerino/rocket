// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: sql_exercise_variations.sql

package db

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

const exerciseVariations_AddParam = `-- name: ExerciseVariations_AddParam :one
INSERT INTO
    exercise_variation_params (exercise_variation_id, parameter_type_id, locked)
VALUES ($1::BIGINT, $2::BIGINT, $3::BOOL) RETURNING id, exercise_variation_id, parameter_type_id, locked
`

type ExerciseVariations_AddParamParams struct {
	ExerciseVariationID int64
	ParameterTypeID     int64
	Locked              bool
}

func (q *Queries) ExerciseVariations_AddParam(ctx context.Context, arg ExerciseVariations_AddParamParams) (ExerciseVariationParam, error) {
	row := q.db.QueryRow(ctx, exerciseVariations_AddParam, arg.ExerciseVariationID, arg.ParameterTypeID, arg.Locked)
	var i ExerciseVariationParam
	err := row.Scan(
		&i.ID,
		&i.ExerciseVariationID,
		&i.ParameterTypeID,
		&i.Locked,
	)
	return i, err
}

const exerciseVariations_Create = `-- name: ExerciseVariations_Create :one
INSERT INTO
    exercise_variations (exercise_id, name)
VALUES ($1::BIGINT, $2::TEXT) RETURNING id, exercise_id, name
`

type ExerciseVariations_CreateParams struct {
	ExerciseID int64
	Name       string
}

func (q *Queries) ExerciseVariations_Create(ctx context.Context, arg ExerciseVariations_CreateParams) (ExerciseVariation, error) {
	row := q.db.QueryRow(ctx, exerciseVariations_Create, arg.ExerciseID, arg.Name)
	var i ExerciseVariation
	err := row.Scan(&i.ID, &i.ExerciseID, &i.Name)
	return i, err
}

const exerciseVariations_ListWithDetails = `-- name: ExerciseVariations_ListWithDetails :many
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
WHERE
    (ev.exercise_id = ANY($1::BIGINT[]) or cardinality($1::bigint[]) = 0) 
    AND (e.user_id = $2::BIGINT or $2::bigint = 0)
    AND (iep.group_id = ANY($3::BIGINT[]) or cardinality($3::bigint[]) = 0)
    AND (iep.plan_interval_id = ANY($4::BIGINT[]) or cardinality($4::bigint[]) = 0)
    AND (iep.plan_id = ANY($5::BIGINT[]) or cardinality($5::bigint[]) = 0)
    AND (ev.id = ANY($6::BIGINT[]) or cardinality($6::bigint[]) = 0)
ORDER BY e.created_at DESC -- Maybe come back and tweak this sort query a little bit
LIMIT $8::int
OFFSET $7::int
`

type ExerciseVariations_ListWithDetailsParams struct {
	ExerciseID     []int64
	UserID         int64
	GroupID        []int64
	PlanIntervalID []int64
	PlanID         []int64
	VariationID    []int64
	Offset         int32
	Limit          int32
}

type ExerciseVariations_ListWithDetailsRow struct {
	ID              int64
	ExerciseID      int64
	EID             int64
	EName           string
	EDescription    string
	EUserID         pgtype.Int8
	ECreatedAt      pgtype.Timestamp
	EUpdatedAt      pgtype.Timestamp
	EvpID           int64
	ParameterTypeID int64
	Locked          bool
	PtID            int64
	PtName          string
	PtDataType      string
	PtDefaultUnit   string
	PtMinValue      pgtype.Float8
	PtMaxValue      pgtype.Float8
}

func (q *Queries) ExerciseVariations_ListWithDetails(ctx context.Context, arg ExerciseVariations_ListWithDetailsParams) ([]ExerciseVariations_ListWithDetailsRow, error) {
	rows, err := q.db.Query(ctx, exerciseVariations_ListWithDetails,
		arg.ExerciseID,
		arg.UserID,
		arg.GroupID,
		arg.PlanIntervalID,
		arg.PlanID,
		arg.VariationID,
		arg.Offset,
		arg.Limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ExerciseVariations_ListWithDetailsRow
	for rows.Next() {
		var i ExerciseVariations_ListWithDetailsRow
		if err := rows.Scan(
			&i.ID,
			&i.ExerciseID,
			&i.EID,
			&i.EName,
			&i.EDescription,
			&i.EUserID,
			&i.ECreatedAt,
			&i.EUpdatedAt,
			&i.EvpID,
			&i.ParameterTypeID,
			&i.Locked,
			&i.PtID,
			&i.PtName,
			&i.PtDataType,
			&i.PtDefaultUnit,
			&i.PtMinValue,
			&i.PtMaxValue,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
