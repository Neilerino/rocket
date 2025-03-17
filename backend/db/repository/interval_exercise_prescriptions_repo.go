package repository

import (
	"backend/db"
	"backend/internal/types"
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgtype"
)

type IntervalExercisePrescriptionsRepository struct {
	Queries *db.Queries
}

type IntervalExercisePrescriptionListParams struct {
	ExerciseId int64
	IntervalId int64
	GroupId    int64
	Offset     int32
	Limit      int32
}

func NewIntervalExercisePrescriptionsRepository(queries *db.Queries) *IntervalExercisePrescriptionsRepository {
	return &IntervalExercisePrescriptionsRepository{Queries: queries}
}

func (r *IntervalExercisePrescriptionsRepository) List(ctx context.Context, params IntervalExercisePrescriptionListParams) ([]db.IntervalExercisePrescription, error) {
	if params.ExerciseId != 0 && params.IntervalId != 0 && params.GroupId != 0 {
		return nil, errors.New("only one of ExerciseId, IntervalId, or GroupId can be specified")
	}

	return r.Queries.IntervalExercisePrescriptions_List(ctx, db.IntervalExercisePrescriptions_ListParams{
		GroupID:     params.GroupId,
		VariationID: params.ExerciseId,
		IntervalID:  params.IntervalId,
		Offset:      params.Offset,
		Limit:       params.Limit,
	})
}

func (r *IntervalExercisePrescriptionsRepository) CreateOne(ctx context.Context, prescription types.IntervalExercisePrescription) (*types.IntervalExercisePrescription, error) {
	row, err := r.Queries.IntervalExercisePrescriptions_CreateOne(ctx, db.IntervalExercisePrescriptions_CreateOneParams{
		GroupID:             prescription.GroupId,
		ExerciseVariationID: prescription.ExerciseVariationId,
		PlanIntervalID:      prescription.PlanIntervalId,
		Rpe:                 pgtype.Int4{Int32: int32(prescription.RPE), Valid: prescription.RPE > 0},
		Sets:                prescription.Sets,
		Reps:                pgtype.Int4{Int32: prescription.Reps, Valid: prescription.Reps > 0},
		Duration:            pgtype.Interval{Microseconds: int64(prescription.Duration)},
		Rest:                pgtype.Interval{Microseconds: int64(prescription.Rest)},
	})
	if err != nil {
		return nil, err
	}

	// Get the exercise variation details
	variationsRepo := &ExerciseVariationsRepository{Queries: r.Queries}
	variations, err := variationsRepo.List(ctx, ExerciseVariationListParams{
		VariationId: prescription.ExerciseVariationId,
		Limit:       1,
	})
	if err != nil {
		return nil, err
	}

	// Check if we found the variation
	if len(variations) == 0 {
		return nil, errors.New("variation not found")
	}

	// Convert the row to a prescription
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

	// Create the exercise variation from the db row
	variation := &types.ExerciseVariation{
		ID:         variations[0].ID,
		ExerciseId: variations[0].ExerciseID,
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
