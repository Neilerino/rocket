// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: query.sql

package db

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

const exerciseVariations_CreateOne = `-- name: ExerciseVariations_CreateOne :one
INSERT INTO
    exercise_variations (
        exercise_id,
        parameter_type_id
    )
VALUES ($1, $2) RETURNING id, exercise_id, parameter_type_id
`

type ExerciseVariations_CreateOneParams struct {
	ExerciseID      int64
	ParameterTypeID pgtype.Int8
}

func (q *Queries) ExerciseVariations_CreateOne(ctx context.Context, arg ExerciseVariations_CreateOneParams) (ExerciseVariation, error) {
	row := q.db.QueryRow(ctx, exerciseVariations_CreateOne, arg.ExerciseID, arg.ParameterTypeID)
	var i ExerciseVariation
	err := row.Scan(&i.ID, &i.ExerciseID, &i.ParameterTypeID)
	return i, err
}

const exerciseVariations_CreateOneWithDetails = `-- name: ExerciseVariations_CreateOneWithDetails :one
WITH
    created_variation AS (
        INSERT INTO
            exercise_variations (
                exercise_id,
                parameter_type_id
            )
        VALUES ($1, $2) RETURNING id, exercise_id, parameter_type_id
    )
SELECT
    ev.id,
    ev.exercise_id,
    ev.parameter_type_id,
    e.id as e_id,
    e.name as e_name,
    e.description as e_description,
    e.user_id as e_user_id,
    e.created_at as e_created_at,
    e.updated_at as e_updated_at,
    pt.id as pt_id,
    pt.name as pt_name,
    pt.data_type as pt_data_type,
    pt.default_unit as pt_default_unit,
    pt.min_value as pt_min_value,
    pt.max_value as pt_max_value
FROM
    created_variation ev
    JOIN exercises e ON e.id = ev.exercise_id
    JOIN parameter_types pt ON pt.id = ev.parameter_type_id
`

type ExerciseVariations_CreateOneWithDetailsParams struct {
	ExerciseID      int64
	ParameterTypeID pgtype.Int8
}

type ExerciseVariations_CreateOneWithDetailsRow struct {
	ID              int64
	ExerciseID      int64
	ParameterTypeID pgtype.Int8
	EID             int64
	EName           string
	EDescription    string
	EUserID         pgtype.Int8
	ECreatedAt      pgtype.Timestamp
	EUpdatedAt      pgtype.Timestamp
	PtID            int64
	PtName          string
	PtDataType      string
	PtDefaultUnit   string
	PtMinValue      pgtype.Float8
	PtMaxValue      pgtype.Float8
}

func (q *Queries) ExerciseVariations_CreateOneWithDetails(ctx context.Context, arg ExerciseVariations_CreateOneWithDetailsParams) (ExerciseVariations_CreateOneWithDetailsRow, error) {
	row := q.db.QueryRow(ctx, exerciseVariations_CreateOneWithDetails, arg.ExerciseID, arg.ParameterTypeID)
	var i ExerciseVariations_CreateOneWithDetailsRow
	err := row.Scan(
		&i.ID,
		&i.ExerciseID,
		&i.ParameterTypeID,
		&i.EID,
		&i.EName,
		&i.EDescription,
		&i.EUserID,
		&i.ECreatedAt,
		&i.EUpdatedAt,
		&i.PtID,
		&i.PtName,
		&i.PtDataType,
		&i.PtDefaultUnit,
		&i.PtMinValue,
		&i.PtMaxValue,
	)
	return i, err
}

const exerciseVariations_DeleteOne = `-- name: ExerciseVariations_DeleteOne :exec
DELETE FROM exercise_variations WHERE id = $1
`

func (q *Queries) ExerciseVariations_DeleteOne(ctx context.Context, id int64) error {
	_, err := q.db.Exec(ctx, exerciseVariations_DeleteOne, id)
	return err
}

const exerciseVariations_GetByExerciseIdWithDetails = `-- name: ExerciseVariations_GetByExerciseIdWithDetails :many
SELECT
    ev.id,
    ev.exercise_id,
    ev.parameter_type_id,
    e.id as e_id,
    e.name as e_name,
    e.description as e_description,
    e.user_id as e_user_id,
    e.created_at as e_created_at,
    e.updated_at as e_updated_at,
    pt.id as pt_id,
    pt.name as pt_name,
    pt.data_type as pt_data_type,
    pt.default_unit as pt_default_unit,
    pt.min_value as pt_min_value,
    pt.max_value as pt_max_value
FROM
    exercise_variations ev
    JOIN exercises e ON e.id = ev.exercise_id
    JOIN parameter_types pt ON pt.id = ev.parameter_type_id
WHERE
    ev.exercise_id = $1
`

type ExerciseVariations_GetByExerciseIdWithDetailsRow struct {
	ID              int64
	ExerciseID      int64
	ParameterTypeID pgtype.Int8
	EID             int64
	EName           string
	EDescription    string
	EUserID         pgtype.Int8
	ECreatedAt      pgtype.Timestamp
	EUpdatedAt      pgtype.Timestamp
	PtID            int64
	PtName          string
	PtDataType      string
	PtDefaultUnit   string
	PtMinValue      pgtype.Float8
	PtMaxValue      pgtype.Float8
}

func (q *Queries) ExerciseVariations_GetByExerciseIdWithDetails(ctx context.Context, exerciseID int64) ([]ExerciseVariations_GetByExerciseIdWithDetailsRow, error) {
	rows, err := q.db.Query(ctx, exerciseVariations_GetByExerciseIdWithDetails, exerciseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ExerciseVariations_GetByExerciseIdWithDetailsRow
	for rows.Next() {
		var i ExerciseVariations_GetByExerciseIdWithDetailsRow
		if err := rows.Scan(
			&i.ID,
			&i.ExerciseID,
			&i.ParameterTypeID,
			&i.EID,
			&i.EName,
			&i.EDescription,
			&i.EUserID,
			&i.ECreatedAt,
			&i.EUpdatedAt,
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

const exerciseVariations_GetByIdWithDetails = `-- name: ExerciseVariations_GetByIdWithDetails :one
SELECT
    ev.id,
    ev.exercise_id,
    ev.parameter_type_id,
    e.id as e_id,
    e.name as e_name,
    e.description as e_description,
    e.user_id as e_user_id,
    e.created_at as e_created_at,
    e.updated_at as e_updated_at,
    pt.id as pt_id,
    pt.name as pt_name,
    pt.data_type as pt_data_type,
    pt.default_unit as pt_default_unit,
    pt.min_value as pt_min_value,
    pt.max_value as pt_max_value
FROM
    exercise_variations ev
    JOIN exercises e ON e.id = ev.exercise_id
    JOIN parameter_types pt ON pt.id = ev.parameter_type_id
WHERE
    ev.id = $1
`

type ExerciseVariations_GetByIdWithDetailsRow struct {
	ID              int64
	ExerciseID      int64
	ParameterTypeID pgtype.Int8
	EID             int64
	EName           string
	EDescription    string
	EUserID         pgtype.Int8
	ECreatedAt      pgtype.Timestamp
	EUpdatedAt      pgtype.Timestamp
	PtID            int64
	PtName          string
	PtDataType      string
	PtDefaultUnit   string
	PtMinValue      pgtype.Float8
	PtMaxValue      pgtype.Float8
}

func (q *Queries) ExerciseVariations_GetByIdWithDetails(ctx context.Context, id int64) (ExerciseVariations_GetByIdWithDetailsRow, error) {
	row := q.db.QueryRow(ctx, exerciseVariations_GetByIdWithDetails, id)
	var i ExerciseVariations_GetByIdWithDetailsRow
	err := row.Scan(
		&i.ID,
		&i.ExerciseID,
		&i.ParameterTypeID,
		&i.EID,
		&i.EName,
		&i.EDescription,
		&i.EUserID,
		&i.ECreatedAt,
		&i.EUpdatedAt,
		&i.PtID,
		&i.PtName,
		&i.PtDataType,
		&i.PtDefaultUnit,
		&i.PtMinValue,
		&i.PtMaxValue,
	)
	return i, err
}

const exercises_CreateOne = `-- name: Exercises_CreateOne :one
INSERT INTO
    exercises (name, description, user_id)
VALUES ($1, $2, $3) RETURNING id, name, description, user_id, created_at, updated_at
`

type Exercises_CreateOneParams struct {
	Name        string
	Description string
	UserID      pgtype.Int8
}

func (q *Queries) Exercises_CreateOne(ctx context.Context, arg Exercises_CreateOneParams) (Exercise, error) {
	row := q.db.QueryRow(ctx, exercises_CreateOne, arg.Name, arg.Description, arg.UserID)
	var i Exercise
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const exercises_DeleteOne = `-- name: Exercises_DeleteOne :exec
DELETE FROM exercises WHERE id = $1
`

func (q *Queries) Exercises_DeleteOne(ctx context.Context, id int64) error {
	_, err := q.db.Exec(ctx, exercises_DeleteOne, id)
	return err
}

const exercises_GetById = `-- name: Exercises_GetById :one
SELECT id, name, description, user_id, created_at, updated_at FROM exercises WHERE id = $1 LIMIT 1
`

func (q *Queries) Exercises_GetById(ctx context.Context, id int64) (Exercise, error) {
	row := q.db.QueryRow(ctx, exercises_GetById, id)
	var i Exercise
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const exercises_GetByPlanId = `-- name: Exercises_GetByPlanId :many
SELECT exercises.id, exercises.name, exercises.description, exercises.user_id, exercises.created_at, exercises.updated_at
FROM
    exercises
    JOIN exercise_variations on exercise_variations.exercise_id = exercises.id
    JOIN interval_exercise_prescriptions on exercise_variations.id = interval_exercise_prescriptions.exercise_variation_id
    JOIN plan_intervals on plan_intervals.id = interval_exercise_prescriptions.plan_interval_id
WHERE
    plan_intervals.plan_id = $1
ORDER BY plan_intervals."order"
LIMIT $2
`

type Exercises_GetByPlanIdParams struct {
	PlanID int64
	Limit  int32
}

func (q *Queries) Exercises_GetByPlanId(ctx context.Context, arg Exercises_GetByPlanIdParams) ([]Exercise, error) {
	rows, err := q.db.Query(ctx, exercises_GetByPlanId, arg.PlanID, arg.Limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Exercise
	for rows.Next() {
		var i Exercise
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.UserID,
			&i.CreatedAt,
			&i.UpdatedAt,
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

const exercises_GetByUserId = `-- name: Exercises_GetByUserId :many
SELECT id, name, description, user_id, created_at, updated_at
FROM exercises
WHERE
    user_id = $1
ORDER BY created_at
LIMIT $2
`

type Exercises_GetByUserIdParams struct {
	UserID pgtype.Int8
	Limit  int32
}

func (q *Queries) Exercises_GetByUserId(ctx context.Context, arg Exercises_GetByUserIdParams) ([]Exercise, error) {
	rows, err := q.db.Query(ctx, exercises_GetByUserId, arg.UserID, arg.Limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Exercise
	for rows.Next() {
		var i Exercise
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.UserID,
			&i.CreatedAt,
			&i.UpdatedAt,
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

const exercises_UpdateOne = `-- name: Exercises_UpdateOne :one
UPDATE exercises
SET
    name = $1,
    description = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE
    id = $3 RETURNING id, name, description, user_id, created_at, updated_at
`

type Exercises_UpdateOneParams struct {
	Name        string
	Description string
	ID          int64
}

func (q *Queries) Exercises_UpdateOne(ctx context.Context, arg Exercises_UpdateOneParams) (Exercise, error) {
	row := q.db.QueryRow(ctx, exercises_UpdateOne, arg.Name, arg.Description, arg.ID)
	var i Exercise
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const groupsJoinPlan_List = `-- name: GroupsJoinPlan_List :many
SELECT groups.id, groups.name, groups.description, groups.user_id, groups.created_at, groups.updated_at from groups 
JOIN interval_group_assignments on groups.id = interval_group_assignments.group_id AND (interval_group_assignments.plan_interval_id = $1::BIGINT or $1::bigint = 0)
JOIN plan_intervals on interval_group_assignments.plan_interval_id = plan_intervals.id AND (plan_intervals.plan_id = $2::BIGINT or $2::bigint = 0)
WHERE 
    (groups.id = $3::BIGINT or $3::bigint = 0) 
ORDER BY groups.created_at DESC
LIMIT $5::int
OFFSET $4::int
`

type GroupsJoinPlan_ListParams struct {
	IntervalID int64
	PlanID     int64
	GroupID    int64
	Offset     int32
	Limit      int32
}

func (q *Queries) GroupsJoinPlan_List(ctx context.Context, arg GroupsJoinPlan_ListParams) ([]Group, error) {
	rows, err := q.db.Query(ctx, groupsJoinPlan_List,
		arg.IntervalID,
		arg.PlanID,
		arg.GroupID,
		arg.Offset,
		arg.Limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Group
	for rows.Next() {
		var i Group
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.UserID,
			&i.CreatedAt,
			&i.UpdatedAt,
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

const groups_CreateOne = `-- name: Groups_CreateOne :one
INSERT INTO
    groups (name, description, user_id)
VALUES ($1, $2, $3) RETURNING id, name, description, user_id, created_at, updated_at
`

type Groups_CreateOneParams struct {
	Name        string
	Description string
	UserID      int64
}

func (q *Queries) Groups_CreateOne(ctx context.Context, arg Groups_CreateOneParams) (Group, error) {
	row := q.db.QueryRow(ctx, groups_CreateOne, arg.Name, arg.Description, arg.UserID)
	var i Group
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const groups_DeleteById = `-- name: Groups_DeleteById :one
DELETE FROM groups WHERE id = $1 RETURNING id, name, description, user_id, created_at, updated_at
`

func (q *Queries) Groups_DeleteById(ctx context.Context, id int64) (Group, error) {
	row := q.db.QueryRow(ctx, groups_DeleteById, id)
	var i Group
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const groups_GetById = `-- name: Groups_GetById :one
SELECT id, name, description, user_id, created_at, updated_at FROM groups WHERE id = $1 LIMIT 1
`

func (q *Queries) Groups_GetById(ctx context.Context, id int64) (Group, error) {
	row := q.db.QueryRow(ctx, groups_GetById, id)
	var i Group
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const groups_GetByPlanId = `-- name: Groups_GetByPlanId :many
SELECT g.id, g.name, g.description, g.user_id, g.created_at, g.updated_at, iga.frequency, pi."order" as interval_order
FROM
    "groups" g
    JOIN interval_group_assignments iga on iga.group_id = g.id
    JOIN plan_intervals pi on pi.id = iga.plan_interval_id
    and pi.plan_id = $1
ORDER BY pi."order"
LIMIT $2
`

type Groups_GetByPlanIdParams struct {
	PlanID int64
	Limit  int32
}

type Groups_GetByPlanIdRow struct {
	ID            int64
	Name          string
	Description   string
	UserID        int64
	CreatedAt     pgtype.Timestamp
	UpdatedAt     pgtype.Timestamp
	Frequency     int32
	IntervalOrder int32
}

func (q *Queries) Groups_GetByPlanId(ctx context.Context, arg Groups_GetByPlanIdParams) ([]Groups_GetByPlanIdRow, error) {
	rows, err := q.db.Query(ctx, groups_GetByPlanId, arg.PlanID, arg.Limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Groups_GetByPlanIdRow
	for rows.Next() {
		var i Groups_GetByPlanIdRow
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.UserID,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.Frequency,
			&i.IntervalOrder,
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

const groups_GetByUserId = `-- name: Groups_GetByUserId :many
SELECT id, name, description, user_id, created_at, updated_at FROM groups WHERE user_id = $1 ORDER BY created_at LIMIT $2
`

type Groups_GetByUserIdParams struct {
	UserID int64
	Limit  int32
}

func (q *Queries) Groups_GetByUserId(ctx context.Context, arg Groups_GetByUserIdParams) ([]Group, error) {
	rows, err := q.db.Query(ctx, groups_GetByUserId, arg.UserID, arg.Limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Group
	for rows.Next() {
		var i Group
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.UserID,
			&i.CreatedAt,
			&i.UpdatedAt,
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

const groups_List = `-- name: Groups_List :many
SELECT id, name, description, user_id, created_at, updated_at from groups 
WHERE 
    (id = $1::BIGINT or $1::bigint = 0) 
ORDER BY created_at DESC
LIMIT $3::int
OFFSET $2::int
`

type Groups_ListParams struct {
	GroupID int64
	Offset  int32
	Limit   int32
}

func (q *Queries) Groups_List(ctx context.Context, arg Groups_ListParams) ([]Group, error) {
	rows, err := q.db.Query(ctx, groups_List, arg.GroupID, arg.Offset, arg.Limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Group
	for rows.Next() {
		var i Group
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.UserID,
			&i.CreatedAt,
			&i.UpdatedAt,
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

const groups_UpdateOne = `-- name: Groups_UpdateOne :one
UPDATE "groups"
SET
    name = $1,
    description = $2
WHERE
    id = $3 RETURNING id, name, description, user_id, created_at, updated_at
`

type Groups_UpdateOneParams struct {
	Name        string
	Description string
	ID          int64
}

func (q *Queries) Groups_UpdateOne(ctx context.Context, arg Groups_UpdateOneParams) (Group, error) {
	row := q.db.QueryRow(ctx, groups_UpdateOne, arg.Name, arg.Description, arg.ID)
	var i Group
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const intervalExercisePrescriptions_CreateOne = `-- name: IntervalExercisePrescriptions_CreateOne :one
INSERT INTO
    interval_exercise_prescriptions (
        group_id,
        exercise_variation_id,
        plan_interval_id,
        rpe,
        sets,
        reps,
        duration,
        rest
    )
VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
    ) RETURNING id, group_id, exercise_variation_id, plan_interval_id, rpe, sets, reps, duration, rest
`

type IntervalExercisePrescriptions_CreateOneParams struct {
	GroupID             int64
	ExerciseVariationID int64
	PlanIntervalID      int64
	Rpe                 pgtype.Int4
	Sets                int32
	Reps                pgtype.Int4
	Duration            pgtype.Interval
	Rest                pgtype.Interval
}

func (q *Queries) IntervalExercisePrescriptions_CreateOne(ctx context.Context, arg IntervalExercisePrescriptions_CreateOneParams) (IntervalExercisePrescription, error) {
	row := q.db.QueryRow(ctx, intervalExercisePrescriptions_CreateOne,
		arg.GroupID,
		arg.ExerciseVariationID,
		arg.PlanIntervalID,
		arg.Rpe,
		arg.Sets,
		arg.Reps,
		arg.Duration,
		arg.Rest,
	)
	var i IntervalExercisePrescription
	err := row.Scan(
		&i.ID,
		&i.GroupID,
		&i.ExerciseVariationID,
		&i.PlanIntervalID,
		&i.Rpe,
		&i.Sets,
		&i.Reps,
		&i.Duration,
		&i.Rest,
	)
	return i, err
}

const intervalExercisePrescriptions_DeleteOne = `-- name: IntervalExercisePrescriptions_DeleteOne :exec
DELETE FROM interval_exercise_prescriptions WHERE id = $1
`

func (q *Queries) IntervalExercisePrescriptions_DeleteOne(ctx context.Context, id int64) error {
	_, err := q.db.Exec(ctx, intervalExercisePrescriptions_DeleteOne, id)
	return err
}

const intervalExercisePrescriptions_GetByGroupId = `-- name: IntervalExercisePrescriptions_GetByGroupId :many
SELECT
    iep.id,
    iep.group_id,
    iep.exercise_variation_id,
    iep.plan_interval_id,
    iep.rpe,
    iep.sets,
    iep.reps,
    iep.duration,
    iep.rest,
    ev.id as ev_id,
    ev.exercise_id as ev_exercise_id,
    ev.parameter_type_id as ev_parameter_type_id,
    e.id as e_id,
    e.name as e_name,
    e.description as e_description,
    e.user_id as e_user_id,
    e.created_at as e_created_at,
    e.updated_at as e_updated_at,
    pt.id as pt_id,
    pt.name as pt_name,
    pt.data_type as pt_data_type,
    pt.default_unit as pt_default_unit,
    pt.min_value as pt_min_value,
    pt.max_value as pt_max_value
FROM
    interval_exercise_prescriptions iep
    JOIN exercise_variations ev ON ev.id = iep.exercise_variation_id
    JOIN exercises e ON e.id = ev.exercise_id
    JOIN parameter_types pt ON pt.id = ev.parameter_type_id
WHERE
    iep.group_id = $1
`

type IntervalExercisePrescriptions_GetByGroupIdRow struct {
	ID                  int64
	GroupID             int64
	ExerciseVariationID int64
	PlanIntervalID      int64
	Rpe                 pgtype.Int4
	Sets                int32
	Reps                pgtype.Int4
	Duration            pgtype.Interval
	Rest                pgtype.Interval
	EvID                int64
	EvExerciseID        int64
	EvParameterTypeID   pgtype.Int8
	EID                 int64
	EName               string
	EDescription        string
	EUserID             pgtype.Int8
	ECreatedAt          pgtype.Timestamp
	EUpdatedAt          pgtype.Timestamp
	PtID                int64
	PtName              string
	PtDataType          string
	PtDefaultUnit       string
	PtMinValue          pgtype.Float8
	PtMaxValue          pgtype.Float8
}

func (q *Queries) IntervalExercisePrescriptions_GetByGroupId(ctx context.Context, groupID int64) ([]IntervalExercisePrescriptions_GetByGroupIdRow, error) {
	rows, err := q.db.Query(ctx, intervalExercisePrescriptions_GetByGroupId, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []IntervalExercisePrescriptions_GetByGroupIdRow
	for rows.Next() {
		var i IntervalExercisePrescriptions_GetByGroupIdRow
		if err := rows.Scan(
			&i.ID,
			&i.GroupID,
			&i.ExerciseVariationID,
			&i.PlanIntervalID,
			&i.Rpe,
			&i.Sets,
			&i.Reps,
			&i.Duration,
			&i.Rest,
			&i.EvID,
			&i.EvExerciseID,
			&i.EvParameterTypeID,
			&i.EID,
			&i.EName,
			&i.EDescription,
			&i.EUserID,
			&i.ECreatedAt,
			&i.EUpdatedAt,
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

const intervalExercisePrescriptions_GetByPlanIntervalId = `-- name: IntervalExercisePrescriptions_GetByPlanIntervalId :many
SELECT
    iep.id,
    iep.group_id,
    iep.exercise_variation_id,
    iep.plan_interval_id,
    iep.rpe,
    iep.sets,
    iep.reps,
    iep.duration,
    iep.rest,
    ev.id as ev_id,
    ev.exercise_id as ev_exercise_id,
    ev.parameter_type_id as ev_parameter_type_id,
    e.id as e_id,
    e.name as e_name,
    e.description as e_description,
    e.user_id as e_user_id,
    e.created_at as e_created_at,
    e.updated_at as e_updated_at,
    pt.id as pt_id,
    pt.name as pt_name,
    pt.data_type as pt_data_type,
    pt.default_unit as pt_default_unit,
    pt.min_value as pt_min_value,
    pt.max_value as pt_max_value
FROM
    interval_exercise_prescriptions iep
    JOIN exercise_variations ev ON ev.id = iep.exercise_variation_id
    JOIN exercises e ON e.id = ev.exercise_id
    JOIN parameter_types pt ON pt.id = ev.parameter_type_id
WHERE
    iep.plan_interval_id = $1
`

type IntervalExercisePrescriptions_GetByPlanIntervalIdRow struct {
	ID                  int64
	GroupID             int64
	ExerciseVariationID int64
	PlanIntervalID      int64
	Rpe                 pgtype.Int4
	Sets                int32
	Reps                pgtype.Int4
	Duration            pgtype.Interval
	Rest                pgtype.Interval
	EvID                int64
	EvExerciseID        int64
	EvParameterTypeID   pgtype.Int8
	EID                 int64
	EName               string
	EDescription        string
	EUserID             pgtype.Int8
	ECreatedAt          pgtype.Timestamp
	EUpdatedAt          pgtype.Timestamp
	PtID                int64
	PtName              string
	PtDataType          string
	PtDefaultUnit       string
	PtMinValue          pgtype.Float8
	PtMaxValue          pgtype.Float8
}

func (q *Queries) IntervalExercisePrescriptions_GetByPlanIntervalId(ctx context.Context, planIntervalID int64) ([]IntervalExercisePrescriptions_GetByPlanIntervalIdRow, error) {
	rows, err := q.db.Query(ctx, intervalExercisePrescriptions_GetByPlanIntervalId, planIntervalID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []IntervalExercisePrescriptions_GetByPlanIntervalIdRow
	for rows.Next() {
		var i IntervalExercisePrescriptions_GetByPlanIntervalIdRow
		if err := rows.Scan(
			&i.ID,
			&i.GroupID,
			&i.ExerciseVariationID,
			&i.PlanIntervalID,
			&i.Rpe,
			&i.Sets,
			&i.Reps,
			&i.Duration,
			&i.Rest,
			&i.EvID,
			&i.EvExerciseID,
			&i.EvParameterTypeID,
			&i.EID,
			&i.EName,
			&i.EDescription,
			&i.EUserID,
			&i.ECreatedAt,
			&i.EUpdatedAt,
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

const intervalGroupAssignments_Create = `-- name: IntervalGroupAssignments_Create :one
INSERT INTO
    interval_group_assignments (
        plan_interval_id,
        group_id,
        frequency
    )
VALUES ($1, $2, $3) RETURNING id, plan_interval_id, group_id, frequency
`

type IntervalGroupAssignments_CreateParams struct {
	PlanIntervalID int64
	GroupID        int64
	Frequency      int32
}

func (q *Queries) IntervalGroupAssignments_Create(ctx context.Context, arg IntervalGroupAssignments_CreateParams) (IntervalGroupAssignment, error) {
	row := q.db.QueryRow(ctx, intervalGroupAssignments_Create, arg.PlanIntervalID, arg.GroupID, arg.Frequency)
	var i IntervalGroupAssignment
	err := row.Scan(
		&i.ID,
		&i.PlanIntervalID,
		&i.GroupID,
		&i.Frequency,
	)
	return i, err
}

const intervalGroupAssignments_Delete = `-- name: IntervalGroupAssignments_Delete :exec
DELETE FROM interval_group_assignments
WHERE
    plan_interval_id = $1
    AND group_id = $2
`

type IntervalGroupAssignments_DeleteParams struct {
	PlanIntervalID int64
	GroupID        int64
}

func (q *Queries) IntervalGroupAssignments_Delete(ctx context.Context, arg IntervalGroupAssignments_DeleteParams) error {
	_, err := q.db.Exec(ctx, intervalGroupAssignments_Delete, arg.PlanIntervalID, arg.GroupID)
	return err
}

const intervalGroupAssignments_GetByGroupId = `-- name: IntervalGroupAssignments_GetByGroupId :many
SELECT
    iga.id, iga.plan_interval_id, iga.group_id, iga.frequency,
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
    iga.group_id = $1
`

type IntervalGroupAssignments_GetByGroupIdRow struct {
	ID             int64
	PlanIntervalID int64
	GroupID        int64
	Frequency      int32
	PiID           int64
	PiPlanID       int64
	PiName         pgtype.Text
	PiDuration     pgtype.Interval
	PiOrder        int32
	PiCreatedAt    pgtype.Timestamp
	PiUpdatedAt    pgtype.Timestamp
}

func (q *Queries) IntervalGroupAssignments_GetByGroupId(ctx context.Context, groupID int64) ([]IntervalGroupAssignments_GetByGroupIdRow, error) {
	rows, err := q.db.Query(ctx, intervalGroupAssignments_GetByGroupId, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []IntervalGroupAssignments_GetByGroupIdRow
	for rows.Next() {
		var i IntervalGroupAssignments_GetByGroupIdRow
		if err := rows.Scan(
			&i.ID,
			&i.PlanIntervalID,
			&i.GroupID,
			&i.Frequency,
			&i.PiID,
			&i.PiPlanID,
			&i.PiName,
			&i.PiDuration,
			&i.PiOrder,
			&i.PiCreatedAt,
			&i.PiUpdatedAt,
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

const intervalGroupAssignments_GetByIntervalId = `-- name: IntervalGroupAssignments_GetByIntervalId :many
SELECT
    iga.id, iga.plan_interval_id, iga.group_id, iga.frequency,
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
    iga.plan_interval_id = $1
`

type IntervalGroupAssignments_GetByIntervalIdRow struct {
	ID             int64
	PlanIntervalID int64
	GroupID        int64
	Frequency      int32
	GID            int64
	GName          string
	GDescription   string
	GUserID        int64
	GCreatedAt     pgtype.Timestamp
	GUpdatedAt     pgtype.Timestamp
}

func (q *Queries) IntervalGroupAssignments_GetByIntervalId(ctx context.Context, planIntervalID int64) ([]IntervalGroupAssignments_GetByIntervalIdRow, error) {
	rows, err := q.db.Query(ctx, intervalGroupAssignments_GetByIntervalId, planIntervalID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []IntervalGroupAssignments_GetByIntervalIdRow
	for rows.Next() {
		var i IntervalGroupAssignments_GetByIntervalIdRow
		if err := rows.Scan(
			&i.ID,
			&i.PlanIntervalID,
			&i.GroupID,
			&i.Frequency,
			&i.GID,
			&i.GName,
			&i.GDescription,
			&i.GUserID,
			&i.GCreatedAt,
			&i.GUpdatedAt,
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

const parameterTypes_CreateOne = `-- name: ParameterTypes_CreateOne :one
INSERT INTO
    parameter_types (
        name,
        data_type,
        default_unit,
        min_value,
        max_value
    )
VALUES ($1, $2, $3, $4, $5) RETURNING id, name, data_type, default_unit, min_value, max_value
`

type ParameterTypes_CreateOneParams struct {
	Name        string
	DataType    string
	DefaultUnit string
	MinValue    pgtype.Float8
	MaxValue    pgtype.Float8
}

func (q *Queries) ParameterTypes_CreateOne(ctx context.Context, arg ParameterTypes_CreateOneParams) (ParameterType, error) {
	row := q.db.QueryRow(ctx, parameterTypes_CreateOne,
		arg.Name,
		arg.DataType,
		arg.DefaultUnit,
		arg.MinValue,
		arg.MaxValue,
	)
	var i ParameterType
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.DataType,
		&i.DefaultUnit,
		&i.MinValue,
		&i.MaxValue,
	)
	return i, err
}

const parameterTypes_GetById = `-- name: ParameterTypes_GetById :one
SELECT id, name, data_type, default_unit, min_value, max_value FROM parameter_types WHERE id = $1
`

func (q *Queries) ParameterTypes_GetById(ctx context.Context, id int64) (ParameterType, error) {
	row := q.db.QueryRow(ctx, parameterTypes_GetById, id)
	var i ParameterType
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.DataType,
		&i.DefaultUnit,
		&i.MinValue,
		&i.MaxValue,
	)
	return i, err
}

const planIntervals_CreateOne = `-- name: PlanIntervals_CreateOne :one
INSERT INTO
    plan_intervals (
        plan_id,
        name,
        description,
        duration,
        "order"
    )
VALUES ($1, $2, $3, $4, $5) RETURNING id, plan_id, name, description, duration, "order", created_at, updated_at
`

type PlanIntervals_CreateOneParams struct {
	PlanID      int64
	Name        pgtype.Text
	Description pgtype.Text
	Duration    pgtype.Interval
	Order       int32
}

func (q *Queries) PlanIntervals_CreateOne(ctx context.Context, arg PlanIntervals_CreateOneParams) (PlanInterval, error) {
	row := q.db.QueryRow(ctx, planIntervals_CreateOne,
		arg.PlanID,
		arg.Name,
		arg.Description,
		arg.Duration,
		arg.Order,
	)
	var i PlanInterval
	err := row.Scan(
		&i.ID,
		&i.PlanID,
		&i.Name,
		&i.Description,
		&i.Duration,
		&i.Order,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const planIntervals_DeleteById = `-- name: PlanIntervals_DeleteById :one
DELETE FROM plan_intervals WHERE id = $1 RETURNING id, plan_id, name, description, duration, "order", created_at, updated_at
`

func (q *Queries) PlanIntervals_DeleteById(ctx context.Context, id int64) (PlanInterval, error) {
	row := q.db.QueryRow(ctx, planIntervals_DeleteById, id)
	var i PlanInterval
	err := row.Scan(
		&i.ID,
		&i.PlanID,
		&i.Name,
		&i.Description,
		&i.Duration,
		&i.Order,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const planIntervals_List = `-- name: PlanIntervals_List :many
SELECT 
    pi.id, pi.plan_id, pi.name, pi.description, pi.duration, pi."order", pi.created_at, pi.updated_at,
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
LIMIT $5
`

type PlanIntervals_ListParams struct {
	PlanID  int64
	Column2 interface{}
	ID      int64
	Column4 interface{}
	Limit   int32
}

type PlanIntervals_ListRow struct {
	ID          int64
	PlanID      int64
	Name        pgtype.Text
	Description pgtype.Text
	Duration    pgtype.Interval
	Order       int32
	CreatedAt   pgtype.Timestamp
	UpdatedAt   pgtype.Timestamp
	GroupCount  int64
}

func (q *Queries) PlanIntervals_List(ctx context.Context, arg PlanIntervals_ListParams) ([]PlanIntervals_ListRow, error) {
	rows, err := q.db.Query(ctx, planIntervals_List,
		arg.PlanID,
		arg.Column2,
		arg.ID,
		arg.Column4,
		arg.Limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []PlanIntervals_ListRow
	for rows.Next() {
		var i PlanIntervals_ListRow
		if err := rows.Scan(
			&i.ID,
			&i.PlanID,
			&i.Name,
			&i.Description,
			&i.Duration,
			&i.Order,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.GroupCount,
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

const planIntervals_UpdateOrderByValues = `-- name: PlanIntervals_UpdateOrderByValues :many
UPDATE plan_intervals as p_i
SET
    "order" = v.new_orders[array_position(v.ids, p_i.id)]
FROM (
        VALUES (
                $1::bigint[], $2::int[]
            )
    ) AS v (ids, new_orders)
WHERE
    p_i.id = ANY (v.ids)
RETURNING
    id, plan_id, name, description, duration, "order", created_at, updated_at
`

type PlanIntervals_UpdateOrderByValuesParams struct {
	IntervalIds []int64
	NewOrders   []int32
}

func (q *Queries) PlanIntervals_UpdateOrderByValues(ctx context.Context, arg PlanIntervals_UpdateOrderByValuesParams) ([]PlanInterval, error) {
	rows, err := q.db.Query(ctx, planIntervals_UpdateOrderByValues, arg.IntervalIds, arg.NewOrders)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []PlanInterval
	for rows.Next() {
		var i PlanInterval
		if err := rows.Scan(
			&i.ID,
			&i.PlanID,
			&i.Name,
			&i.Description,
			&i.Duration,
			&i.Order,
			&i.CreatedAt,
			&i.UpdatedAt,
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

const plans_CreateOne = `-- name: Plans_CreateOne :one
INSERT INTO
    plans (
        name,
        description,
        user_id,
        is_template,
        is_public
    )
VALUES ($1, $2, $3, $4, $5) RETURNING id, name, description, user_id, is_template, is_public, created_at, updated_at
`

type Plans_CreateOneParams struct {
	Name        string
	Description string
	UserID      int64
	IsTemplate  bool
	IsPublic    bool
}

func (q *Queries) Plans_CreateOne(ctx context.Context, arg Plans_CreateOneParams) (Plan, error) {
	row := q.db.QueryRow(ctx, plans_CreateOne,
		arg.Name,
		arg.Description,
		arg.UserID,
		arg.IsTemplate,
		arg.IsPublic,
	)
	var i Plan
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.IsTemplate,
		&i.IsPublic,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const plans_DeleteById = `-- name: Plans_DeleteById :one
DELETE FROM plans WHERE id = $1 RETURNING id, name, description, user_id, is_template, is_public, created_at, updated_at
`

func (q *Queries) Plans_DeleteById(ctx context.Context, id int64) (Plan, error) {
	row := q.db.QueryRow(ctx, plans_DeleteById, id)
	var i Plan
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.IsTemplate,
		&i.IsPublic,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const plans_GetByPlanId = `-- name: Plans_GetByPlanId :one
SELECT id, name, description, user_id, is_template, is_public, created_at, updated_at FROM plans WHERE id = $1 LIMIT 1
`

func (q *Queries) Plans_GetByPlanId(ctx context.Context, id int64) (Plan, error) {
	row := q.db.QueryRow(ctx, plans_GetByPlanId, id)
	var i Plan
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.IsTemplate,
		&i.IsPublic,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const plans_GetByUserId = `-- name: Plans_GetByUserId :many
SELECT id, name, description, user_id, is_template, is_public, created_at, updated_at
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
    $7
`

type Plans_GetByUserIdParams struct {
	UserID     int64
	IsTemplate bool
	Column3    interface{}
	IsPublic   bool
	Column5    interface{}
	Limit      int32
	Offset     int32
}

func (q *Queries) Plans_GetByUserId(ctx context.Context, arg Plans_GetByUserIdParams) ([]Plan, error) {
	rows, err := q.db.Query(ctx, plans_GetByUserId,
		arg.UserID,
		arg.IsTemplate,
		arg.Column3,
		arg.IsPublic,
		arg.Column5,
		arg.Limit,
		arg.Offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Plan
	for rows.Next() {
		var i Plan
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.UserID,
			&i.IsTemplate,
			&i.IsPublic,
			&i.CreatedAt,
			&i.UpdatedAt,
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

const plans_UpdateOne = `-- name: Plans_UpdateOne :one
UPDATE plans
SET
    name = $1,
    description = $2,
    is_template = $3,
    is_public = $4,
    updated_at = CURRENT_TIMESTAMP
WHERE
    id = $5 RETURNING id, name, description, user_id, is_template, is_public, created_at, updated_at
`

type Plans_UpdateOneParams struct {
	Name        string
	Description string
	IsTemplate  bool
	IsPublic    bool
	ID          int64
}

func (q *Queries) Plans_UpdateOne(ctx context.Context, arg Plans_UpdateOneParams) (Plan, error) {
	row := q.db.QueryRow(ctx, plans_UpdateOne,
		arg.Name,
		arg.Description,
		arg.IsTemplate,
		arg.IsPublic,
		arg.ID,
	)
	var i Plan
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.IsTemplate,
		&i.IsPublic,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}
