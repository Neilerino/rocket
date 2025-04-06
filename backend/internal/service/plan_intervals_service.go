package service

import (
	"backend/db/repository"
	"backend/internal/types"
	"backend/internal/utils"
	"context"
)

type PlanIntervalsService struct {
	repo *repository.PlanIntervalsRepository
}

type ListPlanIntervalsArgs struct {
	PlanId int64
	Limit  int32
	Cursor string
}

func NewPlanIntervalsService(repo *repository.PlanIntervalsRepository) *PlanIntervalsService {
	return &PlanIntervalsService{repo: repo}
}

func (s *PlanIntervalsService) ListPlanIntervals(ctx context.Context, planId int64, intervalId int64, limit int32) ([]types.PlanInterval, error) {
	planIntervals, err := s.repo.ListPlanIntervals(ctx, planId, intervalId, limit)
	if err != nil {
		return nil, err
	}

	var result []types.PlanInterval
	for _, planInterval := range planIntervals {
		durationString, err := utils.IntervalToString(planInterval.Duration)
		if err != nil {
			return nil, err
		}

		result = append(result, types.PlanInterval{
			ID:          planInterval.ID,
			PlanID:      planInterval.PlanID,
			Duration:    durationString,
			Name:        planInterval.Name.String,
			Description: planInterval.Description.String,
			Order:       planInterval.Order,
			CreatedAt:   planInterval.CreatedAt.Time.String(),
			UpdatedAt:   planInterval.UpdatedAt.Time.String(),
			GroupCount:  int(planInterval.GroupCount),
		})
	}
	return result, nil
}

func (s *PlanIntervalsService) CreatePlanInterval(ctx context.Context, planId int64, duration string, name string, order int32, description string) (*types.PlanInterval, error) {
	planInterval, err := s.repo.CreatePlanInterval(ctx, planId, duration, name, order, description)
	if err != nil {
		return nil, err
	}

	durationString, err := utils.IntervalToString(planInterval.Duration)
	if err != nil {
		return nil, err
	}

	return &types.PlanInterval{
		ID:          planInterval.ID,
		PlanID:      planInterval.PlanID,
		Duration:    durationString,
		Name:        planInterval.Name.String,
		Order:       planInterval.Order,
		Description: planInterval.Description.String,
		CreatedAt:   planInterval.CreatedAt.Time.String(),
		UpdatedAt:   planInterval.UpdatedAt.Time.String(),
		GroupCount:  0, // New intervals have no groups assigned
	}, nil
}

func (s *PlanIntervalsService) DeletePlanInterval(ctx context.Context, id int64) (*types.PlanInterval, error) {
	planInterval, err := s.repo.DeletePlanInterval(ctx, id)
	if err != nil {
		return nil, err
	}

	durationStr, err := utils.IntervalToString(planInterval.Duration)
	if err != nil {
		return nil, err
	}

	return &types.PlanInterval{
		ID:          planInterval.ID,
		PlanID:      planInterval.PlanID,
		Duration:    durationStr,
		Name:        planInterval.Name.String,
		Order:       planInterval.Order,
		Description: planInterval.Description.String,
		CreatedAt:   planInterval.CreatedAt.Time.String(),
		UpdatedAt:   planInterval.UpdatedAt.Time.String(),
		GroupCount:  0, // Deleted interval has no groups
	}, nil
}
