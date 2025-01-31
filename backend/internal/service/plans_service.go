package service

import (
	"backend/db/repository"
	"backend/internal/types"
	"context"
)

type PlansService struct {
	repo *repository.PlansRepository
}


type ListPlanArgs struct {
	UserId int64
	Limit  int32
	Cursor string
}

func NewPlansService(repo *repository.PlansRepository) *PlansService {
	return &PlansService{repo: repo}
}

func (s *PlansService) GetPlanByUserId(ctx context.Context, id int64, limit int) (*[]types.Plan, error) {
	plans, err := s.repo.GetPlansByUserId(ctx, id, limit)
	if err != nil {
		return nil, err
	}

	var result []types.Plan
	for _, plan := range plans {
		result = append(result, types.Plan{
			ID:          plan.ID,
			Name:        plan.Name,
			Description: plan.Description,
			UserID:      plan.UserID,
			CreatedAt:   plan.CreatedAt.Time.String(),
			UpdatedAt:   plan.UpdatedAt.Time.String(),
		})
	}
	return &result, nil
}

func (s *PlansService) CreatePlan(ctx context.Context, name string, description string, userId int64) (*types.Plan, error) {
	plan, err := s.repo.CreatePlan(ctx, name, description, userId)
	if err != nil {
		return nil, err
	}

	return &types.Plan{
		ID:          plan.ID,
		Name:        plan.Name,
		Description: plan.Description,
		UserID:      plan.UserID,
		CreatedAt:   plan.CreatedAt.Time.String(),
		UpdatedAt:   plan.UpdatedAt.Time.String(),
	}, nil
}
