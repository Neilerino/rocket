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
	UserId     *int64
	PlanId     *int64
	Limit      int32
	Offset     int32
	Cursor     string
	IsTemplate *bool
	IsPublic   *bool
}

func NewPlansService(repo *repository.PlansRepository) *PlansService {
	return &PlansService{repo: repo}
}

func (s *PlansService) DeletePlan(ctx context.Context, id int64) error {
	err := s.repo.DeletePlan(ctx, id)
	if err != nil {
		return err
	}
	return nil
}

func (s *PlansService) GetByPlanId(ctx context.Context, id int64) (*types.Plan, error) {
	plan, err := s.repo.GetPlanById(ctx, id)
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
		IsTemplate:  plan.IsTemplate,
		IsPublic:    plan.IsPublic,
	}, nil
}

// GetPlanByUserId retrieves plans filtered by userId and optional template/public flags
func (s *PlansService) GetPlanByUserId(ctx context.Context, id int64, limit int, offset int, isTemplate *bool, isPublic *bool) (*[]types.Plan, error) {
	plans, err := s.repo.GetPlansByUserId(ctx, id, limit, offset, isTemplate, isPublic)
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
			IsTemplate:  plan.IsTemplate,
			IsPublic:    plan.IsPublic,
		})
	}
	return &result, nil
}

// GetPlans is a more flexible function that can filter by userId, planId, or both
func (s *PlansService) GetPlans(ctx context.Context, args ListPlanArgs) (*[]types.Plan, error) {
	// If planId is specified, get a single plan by ID
	if args.PlanId != nil {
		plan, err := s.GetByPlanId(ctx, *args.PlanId)
		if err != nil {
			return nil, err
		}

		// Return a single plan as a slice for consistent response format
		result := []types.Plan{*plan}
		return &result, nil
	}

	// If userId is specified, get plans by user ID
	if args.UserId != nil {
		return s.GetPlanByUserId(ctx, *args.UserId, int(args.Limit), int(args.Offset), args.IsTemplate, args.IsPublic)
	}

	// If neither is specified, return an empty result
	result := []types.Plan{}
	return &result, nil
}

func (s *PlansService) CreatePlan(ctx context.Context, name string, description string, userId int64, isTemplate bool, isPublic bool) (*types.Plan, error) {
	plan, err := s.repo.CreatePlan(ctx, name, description, userId, isTemplate, isPublic)
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
		IsTemplate:  plan.IsTemplate,
		IsPublic:    plan.IsPublic,
	}, nil
}

func (s *PlansService) UpdatePlan(ctx context.Context, id int64, name string, description string, isTemplate bool, isPublic bool) (*types.Plan, error) {
	plan, err := s.repo.UpdatePlan(ctx, id, name, description, isTemplate, isPublic)
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
		IsTemplate:  plan.IsTemplate,
		IsPublic:    plan.IsPublic,
	}, nil
}
