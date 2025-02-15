package repository

import (
	"backend/db"
	"backend/internal/types"
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

type ExerciseVariationsRepository struct {
	Queries *db.Queries
}

func (r *ExerciseVariationsRepository) GetByExerciseId(ctx context.Context, exerciseId int64) ([]types.ExerciseVariation, error) {
	rows, err := r.Queries.ExerciseVariations_GetByExerciseIdWithDetails(ctx, exerciseId)
	if err != nil {
		return nil, err
	}

	variations := make([]types.ExerciseVariation, len(rows))
	for i, row := range rows {
		variations[i] = types.ExerciseVariation{
			ID:              row.ID,
			ExerciseId:      row.ExerciseID,
			ParameterTypeId: row.ParameterTypeID.Int64,
			Exercise: types.Exercise{
				ID:          row.EID,
				Name:        row.EName,
				Description: row.EDescription,
				UserID:      row.EUserID.Int64,
				CreatedAt:   row.ECreatedAt.Time.String(),
				UpdatedAt:   row.EUpdatedAt.Time.String(),
			},
			ParameterType: types.ParameterType{
				ID:          row.PtID,
				Name:        row.PtName,
				DataType:    row.PtDataType,
				DefaultUnit: row.PtDefaultUnit,
				MinValue:    row.PtMinValue.Float64,
				MaxValue:    row.PtMaxValue.Float64,
			},
		}
	}

	return variations, nil
}

func (r *ExerciseVariationsRepository) GetById(ctx context.Context, id int64) (*types.ExerciseVariation, error) {
	row, err := r.Queries.ExerciseVariations_GetByIdWithDetails(ctx, id)
	if err != nil {
		return nil, err
	}

	return &types.ExerciseVariation{
		ID:              row.ID,
		ExerciseId:      row.ExerciseID,
		ParameterTypeId: row.ParameterTypeID.Int64,
		Exercise: types.Exercise{
			ID:          row.EID,
			Name:        row.EName,
			Description: row.EDescription,
			UserID:      row.EUserID.Int64,
			CreatedAt:   row.ECreatedAt.Time.String(),
			UpdatedAt:   row.EUpdatedAt.Time.String(),
		},
		ParameterType: types.ParameterType{
			ID:          row.PtID,
			Name:        row.PtName,
			DataType:    row.PtDataType,
			DefaultUnit: row.PtDefaultUnit,
			MinValue:    row.PtMinValue.Float64,
			MaxValue:    row.PtMaxValue.Float64,
		},
	}, nil
}

func (r *ExerciseVariationsRepository) CreateOne(ctx context.Context, exerciseId int64, parameterType types.ParameterType) (*types.ExerciseVariation, error) {
	// First create the parameter type
	createdParam, err := r.Queries.ParameterTypes_CreateOne(ctx, db.ParameterTypes_CreateOneParams{
		Name:        parameterType.Name,
		DataType:    parameterType.DataType,
		DefaultUnit: parameterType.DefaultUnit,
		MinValue:    pgtype.Float8{Float64: parameterType.MinValue, Valid: true},
		MaxValue:    pgtype.Float8{Float64: parameterType.MaxValue, Valid: true},
	})
	if err != nil {
		return nil, err
	}

	// Then create the exercise variation with the new parameter type
	row, err := r.Queries.ExerciseVariations_CreateOneWithDetails(ctx, db.ExerciseVariations_CreateOneWithDetailsParams{
		ExerciseID:      exerciseId,
		ParameterTypeID: pgtype.Int8{Int64: createdParam.ID, Valid: true},
	})
	if err != nil {
		return nil, err
	}

	return &types.ExerciseVariation{
		ID:              row.ID,
		ExerciseId:      row.ExerciseID,
		ParameterTypeId: row.ParameterTypeID.Int64,
		Exercise: types.Exercise{
			ID:          row.EID,
			Name:        row.EName,
			Description: row.EDescription,
			UserID:      row.EUserID.Int64,
			CreatedAt:   row.ECreatedAt.Time.String(),
			UpdatedAt:   row.EUpdatedAt.Time.String(),
		},
		ParameterType: types.ParameterType{
			ID:          row.PtID,
			Name:        row.PtName,
			DataType:    row.PtDataType,
			DefaultUnit: row.PtDefaultUnit,
			MinValue:    row.PtMinValue.Float64,
			MaxValue:    row.PtMaxValue.Float64,
		},
	}, nil
}

func (r *ExerciseVariationsRepository) DeleteOne(ctx context.Context, id int64) error {
	return r.Queries.ExerciseVariations_DeleteOne(ctx, id)
}
