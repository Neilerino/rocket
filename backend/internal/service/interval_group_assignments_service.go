package service

import (
	"backend/db/repository"
	"backend/internal/types"
	"context"
)

type IntervalGroupAssignmentsService struct {
	repo *repository.IntervalGroupAssignmentsRepository
}

func NewIntervalGroupAssignmentsService(repo *repository.IntervalGroupAssignmentsRepository) *IntervalGroupAssignmentsService {
	return &IntervalGroupAssignmentsService{
		repo: repo,
	}
}

func (s *IntervalGroupAssignmentsService) GetByIntervalId(ctx context.Context, intervalId int64) ([]types.IntervalGroupAssignment, error) {
	return s.repo.GetByIntervalId(ctx, intervalId)
}

func (s *IntervalGroupAssignmentsService) GetByGroupId(ctx context.Context, groupId int64) ([]types.IntervalGroupAssignment, error) {
	return s.repo.GetByGroupId(ctx, groupId)
}

func (s *IntervalGroupAssignmentsService) AssignGroupToInterval(ctx context.Context, planIntervalId int64, groupId int64, frequency int32) (*types.IntervalGroupAssignment, error) {
	assignment := types.IntervalGroupAssignment{
		PlanIntervalId: planIntervalId,
		GroupId:        groupId,
		Frequency:      frequency,
	}
	return s.repo.CreateOne(ctx, assignment)
}

func (s *IntervalGroupAssignmentsService) RemoveGroupFromInterval(ctx context.Context, planIntervalId int64, groupId int64) error {
	return s.repo.DeleteOne(ctx, planIntervalId, groupId)
}
