package repository

import (
	"backend/db"
	"context"
)

type ExerciseVariationsRepository struct {
	Queries *db.Queries
}

type ExerciseVariationListParams struct {
	ExerciseId     []int64
	GroupId        []int64
	PlanId         []int64
	PlanIntervalId []int64
	VariationId    []int64
	UserId         int64
	Limit          int32
	Offset         int32
}

func NewExerciseVariationsRepository(queries *db.Queries) *ExerciseVariationsRepository {
	return &ExerciseVariationsRepository{Queries: queries}
}

func (r *ExerciseVariationsRepository) List(ctx context.Context, params ExerciseVariationListParams) ([]db.ExerciseVariations_ListWithDetailsRow, error) {
	rows, err := r.Queries.ExerciseVariations_ListWithDetails(ctx, db.ExerciseVariations_ListWithDetailsParams{
		ExerciseID:     params.ExerciseId,
		GroupID:        params.GroupId,
		PlanID:         params.PlanId,
		PlanIntervalID: params.PlanIntervalId,
		VariationID:    params.VariationId,
		UserID:         params.UserId,
		Limit:          params.Limit,
		Offset:         params.Offset,
	})
	if err != nil {
		return nil, err
	}

	return rows, nil
}

func (r *ExerciseVariationsRepository) CreateExerciseVariation(ctx context.Context, exerciseId int64, name string) (db.ExerciseVariation, error) {
	return r.Queries.ExerciseVariations_Create(ctx, db.ExerciseVariations_CreateParams{
		ExerciseID: exerciseId,
		Name:       name,
	})
}

func (r *ExerciseVariationsRepository) AddParam(ctx context.Context, variationId int64, parameterTypeId int64, locked bool) (db.ExerciseVariationParam, error) {
	return r.Queries.ExerciseVariations_AddParam(ctx, db.ExerciseVariations_AddParamParams{
		ExerciseVariationID: variationId,
		ParameterTypeID:     parameterTypeId,
		Locked:              locked,
	})
}

func (r *ExerciseVariationsRepository) DeleteOne(ctx context.Context, id int64) error {
	return r.Queries.ExerciseVariations_DeleteOne(ctx, id)
}
