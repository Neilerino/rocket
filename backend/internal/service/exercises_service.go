package service

import (
	"backend/db/repository"
	"backend/internal/types"
	"context"
)

type ExercisesService struct {
	repo *repository.ExercisesRepository
}

func NewExercisesService(repo *repository.ExercisesRepository) *ExercisesService {
	return &ExercisesService{repo: repo}
}

func (s *ExercisesService) GetExercisesByUserId(ctx context.Context, userId int64, limit int32) (*[]types.Exercise, error) {
	exercises, err := s.repo.GetExercisesByUserId(ctx, userId, limit)
	if err != nil {
		return nil, err
	}

	var result []types.Exercise
	for _, exercise := range exercises {
		result = append(result, types.Exercise{
			ID:          exercise.ID,
			Name:        exercise.Name,
			Description: exercise.Description,
			UserID:      exercise.UserID.Int64,
			CreatedAt:   exercise.CreatedAt.Time.String(),
			UpdatedAt:   exercise.UpdatedAt.Time.String(),
		})
	}
	return &result, nil
}

func (s *ExercisesService) GetExerciseById(ctx context.Context, id int64) (*types.Exercise, error) {
	exercise, err := s.repo.GetExerciseById(ctx, id)
	if err != nil {
		return nil, err
	}

	return &types.Exercise{
		ID:          exercise.ID,
		Name:        exercise.Name,
		Description: exercise.Description,
		UserID:      exercise.UserID.Int64,
		CreatedAt:   exercise.CreatedAt.Time.String(),
		UpdatedAt:   exercise.UpdatedAt.Time.String(),
	}, nil
}

func (s *ExercisesService) CreateExercise(ctx context.Context, name string, description string, userId int64) (*types.Exercise, error) {
	exercise, err := s.repo.CreateExercise(ctx, name, description, userId)
	if err != nil {
		return nil, err
	}

	return &types.Exercise{
		ID:          exercise.ID,
		Name:        exercise.Name,
		Description: exercise.Description,
		UserID:      exercise.UserID.Int64,
		CreatedAt:   exercise.CreatedAt.Time.String(),
		UpdatedAt:   exercise.UpdatedAt.Time.String(),
	}, nil
}

func (s *ExercisesService) UpdateExercise(ctx context.Context, id int64, name string, description string) (*types.Exercise, error) {
	exercise, err := s.repo.UpdateExercise(ctx, id, name, description)
	if err != nil {
		return nil, err
	}

	return &types.Exercise{
		ID:          exercise.ID,
		Name:        exercise.Name,
		Description: exercise.Description,
		UserID:      exercise.UserID.Int64,
		CreatedAt:   exercise.CreatedAt.Time.String(),
		UpdatedAt:   exercise.UpdatedAt.Time.String(),
	}, nil
}

func (s *ExercisesService) DeleteExercise(ctx context.Context, id int64) error {
	return s.repo.DeleteExercise(ctx, id)
}
