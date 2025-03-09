package service

import (
	"backend/db/repository"
	"backend/internal/types"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"
)

type PlanIntervalsService struct {
	repo *repository.PlanIntervalsRepository
}

type ListPlanIntervalsArgs struct {
	PlanId int64
	Limit int32
	Cursor string
}

func NewPlanIntervalsService(repo *repository.PlanIntervalsRepository) *PlanIntervalsService {
	return &PlanIntervalsService{repo: repo}
}

func intervalToString(interval pgtype.Interval) string {
	var result string
	if interval.Months != 0 {
		result += fmt.Sprint(interval.Months) + "M"
	}
	if interval.Days != 0 {
		result += fmt.Sprint(interval.Days) + "D"
	}
	if interval.Microseconds != 0 {
		result += fmt.Sprint(interval.Microseconds) + "u"
	}
	return result
}

func (s *PlanIntervalsService) ListPlanIntervals(ctx context.Context, planId int64, intervalId int64, limit int32) ([]types.PlanInterval, error) {
	planIntervals, err := s.repo.ListPlanIntervals(ctx, planId, intervalId, limit)
	if err != nil {
		return nil, err
	}

	var result []types.PlanInterval
	for _, planInterval := range planIntervals {
		result = append(result, types.PlanInterval{
			ID: planInterval.ID,
			PlanID: planInterval.PlanID,
			Duration: planInterval.Duration.Microseconds,
			Name: planInterval.Name.String,
			Order: planInterval.Order,
		})
	}
	return result, nil
}

func (s *PlanIntervalsService) CreatePlanInterval(ctx context.Context, planId int64, duration string, name string, order int32, description string) (*types.PlanInterval, error) {
	planInterval, err := s.repo.CreatePlanInterval(ctx, planId, duration, name, order, description)
	if err != nil {
		return nil, err
	}

	return &types.PlanInterval{
		ID: planInterval.ID,
		PlanID: planInterval.PlanID,
		Duration: planInterval.Duration.Microseconds,
		Name: planInterval.Name.String,
		Order: planInterval.Order,
		Description: planInterval.Description.String,
	}, nil
}

func (s *PlanIntervalsService) DeletePlanInterval(ctx context.Context, id int64) (*types.PlanInterval, error) {
	planInterval, err := s.repo.DeletePlanInterval(ctx, id)
	if err != nil {
		return nil, err
	}

	return &types.PlanInterval{
		ID: planInterval.ID,
		PlanID: planInterval.PlanID,
		Duration: planInterval.Duration.Microseconds,
		Name: planInterval.Name.String,
		Order: planInterval.Order,
	}, nil
}
