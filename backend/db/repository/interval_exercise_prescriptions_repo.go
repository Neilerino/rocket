package repository

import (
	"backend/db"
	"backend/internal/types"
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

type IntervalExercisePrescriptionsRepository struct {
	Queries *db.Queries
}

func (r *IntervalExercisePrescriptionsRepository) GetByGroupId(ctx context.Context, groupId int64) ([]types.IntervalExercisePrescription, error) {
	rows, err := r.Queries.IntervalExercisePrescriptions_GetByGroupId(ctx, groupId)
	if err != nil {
		return nil, err
	}

	prescriptions := make([]types.IntervalExercisePrescription, len(rows))
	for i, row := range rows {
		rpe := 0.0
		if row.Rpe.Valid {
			rpe = float64(row.Rpe.Int32)
		}
		reps := int32(0)
		if row.Reps.Valid {
			reps = row.Reps.Int32
		}
		duration := int32(0)
		if row.Duration.Microseconds != 0 {
			duration = int32(row.Duration.Microseconds)
		}
		rest := int32(0)
		if row.Rest.Microseconds != 0 {
			rest = int32(row.Rest.Microseconds)
		}

		prescriptions[i] = types.IntervalExercisePrescription{
			ID:                  row.ID,
			GroupId:             row.GroupID,
			ExerciseVariationId: row.ExerciseVariationID,
			PlanIntervalId:      row.PlanIntervalID,
			RPE:                 rpe,
			Sets:                row.Sets,
			Reps:                reps,
			Duration:            duration,
			Rest:                rest,
			ExerciseVariation: &types.ExerciseVariation{
				ID:         row.EvID,
				ExerciseId: row.EvExerciseID,
			},
		}
	}

	return prescriptions, nil
}

func (r *IntervalExercisePrescriptionsRepository) CreateOne(ctx context.Context, prescription types.IntervalExercisePrescription) (*types.IntervalExercisePrescription, error) {
	row, err := r.Queries.IntervalExercisePrescriptions_CreateOne(ctx, db.IntervalExercisePrescriptions_CreateOneParams{
		GroupID:             prescription.GroupId,
		ExerciseVariationID: prescription.ExerciseVariationId,
		PlanIntervalID:      prescription.PlanIntervalId,
		Rpe:                 pgtype.Int4{Int32: int32(prescription.RPE), Valid: true},
		Sets:                prescription.Sets,
		Reps:                pgtype.Int4{Int32: prescription.Reps, Valid: true},
		Duration:            pgtype.Interval{Microseconds: int64(prescription.Duration)},
		Rest:                pgtype.Interval{Microseconds: int64(prescription.Rest)},
	})
	if err != nil {
		return nil, err
	}

	// Get the exercise variation details
	variationsRepo := &ExerciseVariationsRepository{Queries: r.Queries}
	variation, err := variationsRepo.GetById(ctx, prescription.ExerciseVariationId)
	if err != nil {
		return nil, err
	}

	rpe := 0.0
	if row.Rpe.Valid {
		rpe = float64(row.Rpe.Int32)
	}
	reps := int32(0)
	if row.Reps.Valid {
		reps = row.Reps.Int32
	}
	duration := int32(0)
	if row.Duration.Microseconds != 0 {
		duration = int32(row.Duration.Microseconds)
	}
	rest := int32(0)
	if row.Rest.Microseconds != 0 {
		rest = int32(row.Rest.Microseconds)
	}

	return &types.IntervalExercisePrescription{
		ID:                  row.ID,
		GroupId:             row.GroupID,
		ExerciseVariationId: row.ExerciseVariationID,
		PlanIntervalId:      row.PlanIntervalID,
		RPE:                 rpe,
		Sets:                row.Sets,
		Reps:                reps,
		Duration:            duration,
		Rest:                rest,
		ExerciseVariation:   variation,
	}, nil
}

func (r *IntervalExercisePrescriptionsRepository) DeleteOne(ctx context.Context, id int64) error {
	return r.Queries.IntervalExercisePrescriptions_DeleteOne(ctx, id)
}
