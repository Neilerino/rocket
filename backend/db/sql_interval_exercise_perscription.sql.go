// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: sql_interval_exercise_perscription.sql

package db

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

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

const intervalExercisePrescriptions_List = `-- name: IntervalExercisePrescriptions_List :many
SELECT
    iep.id,
    iep.group_id,
    iep.exercise_variation_id,
    iep.plan_interval_id,
    iep.rpe,
    iep.sets,
    iep.reps,
    iep.duration,
    iep.rest
FROM
    interval_exercise_prescriptions iep
WHERE
    (iep.group_id = $1::BIGINT or $1::bigint = 0)
    AND (iep.id = $2::BIGINT or $2::bigint = 0)
    AND (iep.exercise_variation_id = $3::BIGINT or $3::bigint = 0)
    AND (iep.plan_interval_id = $4::BIGINT or $4::bigint = 0)
LIMIT $6::int
OFFSET $5::int
`

type IntervalExercisePrescriptions_ListParams struct {
	GroupID        int64
	PrescriptionID int64
	VariationID    int64
	IntervalID     int64
	Offset         int32
	Limit          int32
}

func (q *Queries) IntervalExercisePrescriptions_List(ctx context.Context, arg IntervalExercisePrescriptions_ListParams) ([]IntervalExercisePrescription, error) {
	rows, err := q.db.Query(ctx, intervalExercisePrescriptions_List,
		arg.GroupID,
		arg.PrescriptionID,
		arg.VariationID,
		arg.IntervalID,
		arg.Offset,
		arg.Limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []IntervalExercisePrescription
	for rows.Next() {
		var i IntervalExercisePrescription
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
