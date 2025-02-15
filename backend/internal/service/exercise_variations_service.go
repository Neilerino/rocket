package service

import (
	"backend/db/repository"
	"backend/internal/types"
	"context"
)

type ExerciseVariationsService struct {
	repo *repository.ExerciseVariationsRepository
}

func NewExerciseVariationsService(repo *repository.ExerciseVariationsRepository) *ExerciseVariationsService {
	return &ExerciseVariationsService{repo: repo}
}

func (s *ExerciseVariationsService) GetByExerciseId(ctx context.Context, exerciseId int64) (*[]types.ExerciseVariation, error) {
	variations, err := s.repo.GetByExerciseId(ctx, exerciseId)
	if err != nil {
		return nil, err
	}
	return &variations, nil
}

func (s *ExerciseVariationsService) GetById(ctx context.Context, id int64) (*types.ExerciseVariation, error) {
	return s.repo.GetById(ctx, id)
}

func (s *ExerciseVariationsService) CreateOne(ctx context.Context, exerciseId int64, parameterType types.ParameterType) (*types.ExerciseVariation, error) {
	return s.repo.CreateOne(ctx, exerciseId, parameterType)
}

func (s *ExerciseVariationsService) DeleteOne(ctx context.Context, id int64) error {
	return s.repo.DeleteOne(ctx, id)
}
