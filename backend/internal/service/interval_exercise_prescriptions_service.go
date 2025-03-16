package service

import (
	"backend/db/repository"
	"backend/internal/types"
	"context"
)

type IntervalExercisePrescriptionsService struct {
	repo *repository.IntervalExercisePrescriptionsRepository
}

func NewIntervalExercisePrescriptionsService(repo *repository.IntervalExercisePrescriptionsRepository) *IntervalExercisePrescriptionsService {
	return &IntervalExercisePrescriptionsService{repo: repo}
}

func (s *IntervalExercisePrescriptionsService) CreateOne(ctx context.Context, prescription types.IntervalExercisePrescription) (*types.IntervalExercisePrescription, error) {
	return s.repo.CreateOne(ctx, prescription)
}

func (s *IntervalExercisePrescriptionsService) DeleteOne(ctx context.Context, id int64) error {
	return s.repo.DeleteOne(ctx, id)
}
