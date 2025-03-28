package service

import (
	"backend/db"
	"backend/db/repository"
	"backend/internal/types"
	"context"
	"errors"
)

type ExerciseVariationsService struct {
	VariationRepo      *repository.ExerciseVariationsRepository
	ExerciseRepo       *repository.ExercisesRepository
	ParameterTypesRepo *repository.ParameterTypesRepository
}

type ExerciseVariationListParams struct {
	ExerciseId     []int64
	GroupId        []int64
	PlanId         []int64
	PlanIntervalId []int64
	UserId         int64
	VariationId    []int64
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
	Name           string
	ParameterTypes []CreateExerciseParameterTypeParams
}

func NewExerciseVariationsService(queries *db.Queries) *ExerciseVariationsService {
	variationRepo := repository.NewExerciseVariationsRepository(queries)
	exerciseRepo := repository.NewExercisesRepository(queries)
	parameterTypesRepo := repository.NewParameterTypesRepository(queries)
	return &ExerciseVariationsService{VariationRepo: variationRepo, ExerciseRepo: exerciseRepo, ParameterTypesRepo: parameterTypesRepo}
}

func (s *ExerciseVariationsService) List(ctx context.Context, params ExerciseVariationListParams) ([]types.ExerciseVariation, error) {
	repoParams := repository.ExerciseVariationListParams{
		ExerciseId:     params.ExerciseId,
		GroupId:        params.GroupId,
		PlanId:         params.PlanId,
		PlanIntervalId: params.PlanIntervalId,
		UserId:         params.UserId,
		VariationId:    params.VariationId,
		Limit:          params.Limit,
		Offset:         params.Offset,
	}

	rows, err := s.VariationRepo.List(ctx, repoParams)
	if err != nil {
		return nil, err
	}

	variations := ExerciseVariationRowToApi(rows)

	return variations, nil
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
			p, err := s.ParameterTypesRepo.Create(ctx, repository.CreateParameterTypeParams{
				Name:        *parameterTypeArg.Name,
				DataType:    *parameterTypeArg.DataType,
				DefaultUnit: *parameterTypeArg.DefaultUnit,
				MinValue:    *parameterTypeArg.MinValue,
				MaxValue:    *parameterTypeArg.MaxValue,
			})
			if err != nil {
				return nil, err
			}
			s.VariationRepo.AddParam(ctx, exerciseVariation.ID, p.ID, parameterTypeArg.Locked)
		}
	}

	return &types.ExerciseVariation{
		ID:         exerciseVariation.ID,
		ExerciseId: exerciseId,
	}, nil
}
