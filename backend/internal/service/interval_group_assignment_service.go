package service

import (
	"backend/db/repository"
	"context"
)

type IntervalGroupAssignmentService struct {
	repo *repository.IntervalGroupAssignmentRepository
}

func NewIntervalGroupAssignmentService(repo *repository.IntervalGroupAssignmentRepository) *IntervalGroupAssignmentService {
	return &IntervalGroupAssignmentService{repo: repo}
}

func (s *IntervalGroupAssignmentService) CreateIntervalGroupAssignment(ctx context.Context, planIntervalId int64, groupId int64) error {
	_, err := s.repo.Create(ctx, planIntervalId, groupId)
	return err
}

func (s *IntervalGroupAssignmentService) DeleteIntervalGroupAssignment(ctx context.Context, planIntervalId int64, groupId int64) error {
	_, err := s.repo.Delete(ctx, planIntervalId, groupId)
	return err
}