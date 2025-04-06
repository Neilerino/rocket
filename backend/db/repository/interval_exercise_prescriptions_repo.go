package repository

import (
	"backend/db"
	"backend/internal/utils"
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgtype"
)

type IntervalExercisePrescriptionsRepository struct {
	Queries *db.Queries
}

type IntervalExercisePrescriptionListParams struct {
	PrescriptionId int64
	ExerciseId     int64
	IntervalId     int64
	GroupId        int64
	Offset         int32
	Limit          int32
}

type PrescriptionCreateData struct {
	GroupId        int64
	VariationId    int64
	PlanIntervalId int64
	RPE            int32
	Sets           int32
	Reps           int32
	Duration       string
	Rest           string
}

func NewIntervalExercisePrescriptionsRepository(queries *db.Queries) *IntervalExercisePrescriptionsRepository {
	return &IntervalExercisePrescriptionsRepository{Queries: queries}
}

func (r *IntervalExercisePrescriptionsRepository) List(ctx context.Context, params IntervalExercisePrescriptionListParams) ([]db.IntervalExercisePrescription, error) {
	if params.ExerciseId != 0 && params.IntervalId != 0 && params.GroupId != 0 {
		return nil, errors.New("only one of ExerciseId, IntervalId, or GroupId can be specified")
	}

	return r.Queries.IntervalExercisePrescriptions_List(ctx, db.IntervalExercisePrescriptions_ListParams{
		PrescriptionID: params.PrescriptionId,
		GroupID:        params.GroupId,
		VariationID:    params.ExerciseId,
		IntervalID:     params.IntervalId,
		Offset:         params.Offset,
		Limit:          params.Limit,
	})
}

func (r *IntervalExercisePrescriptionsRepository) CreateOne(ctx context.Context, prescription PrescriptionCreateData) (*db.IntervalExercisePrescription, error) {
	duration, err := utils.StringToInterval(prescription.Duration)
	if err != nil {
		return nil, err
	}

	rest, err := utils.StringToInterval(prescription.Rest)
	if err != nil {
		return nil, err
	}

	row, err := r.Queries.IntervalExercisePrescriptions_CreateOne(ctx, db.IntervalExercisePrescriptions_CreateOneParams{
		GroupID:             prescription.GroupId,
		ExerciseVariationID: prescription.VariationId,
		PlanIntervalID:      prescription.PlanIntervalId,
		Rpe:                 pgtype.Int4{Int32: int32(prescription.RPE), Valid: prescription.RPE > 0},
		Sets:                prescription.Sets,
		Reps:                pgtype.Int4{Int32: prescription.Reps, Valid: prescription.Reps > 0},
		Duration:            duration,
		Rest:                rest,
	})
	if err != nil {
		return nil, err
	}

	return &row, nil
}

func (r *IntervalExercisePrescriptionsRepository) DeleteOne(ctx context.Context, id int64) error {
	return r.Queries.IntervalExercisePrescriptions_DeleteOne(ctx, id)
}
