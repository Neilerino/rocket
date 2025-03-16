package service

import (
	"backend/db/repository"
	"backend/internal/types"
	"context"
	"errors"
)

type ExerciseVariationsService struct {
	VariationRepo *repository.ExerciseVariationsRepository
	ExerciseRepo  *repository.ExercisesRepository
}

type ExerciseVariationListParams struct {
	ExerciseId     int64
	GroupId        int64
	PlanId         int64
	PlanIntervalId int64
	UserId         int64
	Limit          int32
	Offset         int32
}

type CreateExerciseParameterTypeParams struct {
	ParameterTypeId *int64
	Name            *string
	DataType        *string
	DefaultUnit     *string
	MinValue        *float64
	MaxValue        *float64
	Locked          bool
}

type ExerciseVariationCreateParams struct {
	ExerciseId     int64
	ParameterTypes []CreateExerciseParameterTypeParams
}

func (s *ExerciseVariationsService) List(ctx context.Context, params ExerciseVariationListParams) ([]types.ExerciseVariation, error) {
	repoParams := repository.ExerciseVariationListParams{
		ExerciseId:     params.ExerciseId,
		GroupId:        params.GroupId,
		PlanId:         params.PlanId,
		PlanIntervalId: params.PlanIntervalId,
		UserId:         params.UserId,
		Limit:          params.Limit,
		Offset:         params.Offset,
	}

	rows, err := s.VariationRepo.List(ctx, repoParams)
	if err != nil {
		return nil, err
	}

	variationsMap := make(map[int64]*types.ExerciseVariation)

	for _, row := range rows {
		variation, exists := variationsMap[row.ID]

		if !exists {
			variation = &types.ExerciseVariation{
				ID:         row.ID,
				ExerciseId: row.ExerciseID,
				Parameters: []types.ExerciseVariationParam{},
			}
			variationsMap[row.ID] = variation
		}

		param := types.ExerciseVariationParam{
			ID:                  row.EvpID,
			ExerciseVariationId: row.ID,
			Locked:              row.Locked,
			ParameterTypeId:     row.PtID,
			ParameterType: types.ParameterType{
				ID:          row.PtID,
				Name:        row.PtName,
				DataType:    row.PtDataType,
				DefaultUnit: row.PtDefaultUnit,
				MinValue:    row.PtMinValue.Float64,
				MaxValue:    row.PtMaxValue.Float64,
			},
		}
		variation.Parameters = append(variation.Parameters, param)
	}

	variations := make([]types.ExerciseVariation, 0, len(variationsMap))
	for _, variation := range variationsMap {
		variations = append(variations, *variation)
	}

	return variations, nil
}

func NewExerciseVariationsService(variationRepo *repository.ExerciseVariationsRepository, exerciseRepo *repository.ExercisesRepository) *ExerciseVariationsService {
	return &ExerciseVariationsService{VariationRepo: variationRepo, ExerciseRepo: exerciseRepo}
}

func (s *ExerciseVariationsService) GetById(ctx context.Context, id int64) (*types.ExerciseVariation, error) {
	return s.VariationRepo.GetById(ctx, id)
}

func (s *ExerciseVariationsService) DeleteOne(ctx context.Context, id int64) error {
	return s.VariationRepo.DeleteOne(ctx, id)
}

func (s *ExerciseVariationsService) CreateVariation(ctx context.Context, exerciseId int64, parameterTypeArgs ExerciseVariationCreateParams) (*types.ExerciseVariation, error) {
	exercise, err := s.ExerciseRepo.GetExerciseById(ctx, exerciseId)
	if err != nil {
		return nil, err
	}

	if exercise == nil {
		return nil, errors.New("exercise not found")
	}

	exerciseVariation, err := s.VariationRepo.CreateExerciseVariation(ctx, exerciseId, parameterTypeArgs.Name)
	if err != nil {
		return nil, err
	}

	for _, parameterTypeArg := range parameterTypeArgs.ParameterTypes {
		if parameterTypeArg.ParameterTypeId != nil {
			s.VariationRepo.AddParam(ctx, exerciseVariation.ID, *parameterTypeArg.ParameterTypeId, parameterTypeArg.Locked)
		}
		if parameterTypeArg.ParameterTypeId == nil {
			// TODO: Create Parameter type
			// Assign that parameter type to the variation
		}
	}

	return nil, nil
}
