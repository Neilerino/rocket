package repository

import (
	"backend/db"
	"context"
)

type PlansRepository struct {
	Queries *db.Queries
}

type GetPlansParams struct {
	UserID      int64
	Limit       int32
	Offset      int32
	IsTemplate  *bool
	IsPublic    *bool
}

func (r *PlansRepository) GetPlansByUserId(ctx context.Context, userId int64, limit int, offset int, isTemplate *bool, isPublic *bool) ([]db.Plan, error) {
	// Set default values for the filter flags
	filterByTemplate := false
	filterByPublic := false
	
	// Set template filter values
	templateValue := false
	if isTemplate != nil {
		filterByTemplate = true
		templateValue = *isTemplate
	}
	
	// Set public filter values
	publicValue := false
	if isPublic != nil {
		filterByPublic = true
		publicValue = *isPublic
	}
	
	plans, err := r.Queries.Plans_GetByUserId(ctx, db.Plans_GetByUserIdParams{
		UserID: userId,
		IsTemplate: templateValue,
		Column3: filterByTemplate,
		IsPublic: publicValue,
		Column5: filterByPublic,
		Limit: int32(limit),
		Offset: int32(offset),
	})
	if err != nil {
		return nil, err
	}
	return plans, nil
}

func (r *PlansRepository) CreatePlan(ctx context.Context, name string, description string, userId int64, isTemplate bool, isPublic bool) (*db.Plan, error) {
	plan, err := r.Queries.Plans_CreateOne(ctx, db.Plans_CreateOneParams{
		Name:          name, 
		Description:   description, 
		UserID:        userId,
		IsTemplate:    isTemplate,
		IsPublic:      isPublic,
	})
	if err != nil {
		return nil, err
	}
	return &plan, nil
}

func (r *PlansRepository) UpdatePlan(ctx context.Context, id int64, name string, description string, isTemplate bool, isPublic bool) (*db.Plan, error) {
	plan, err := r.Queries.Plans_UpdateOne(ctx, db.Plans_UpdateOneParams{
		ID:            id,
		Name:          name,
		Description:   description,
		IsTemplate:    isTemplate,
		IsPublic:      isPublic,
	})
	if err != nil {
		return nil, err
	}
	return &plan, nil
}

func (r *PlansRepository) GetPlanById(ctx context.Context, id int64) (*db.Plan, error) {
	plan, err := r.Queries.Plans_GetByPlanId(ctx, id)
	if err != nil {
		return nil, err
	}
	return &plan, nil
}

func (r *PlansRepository) DeletePlan(ctx context.Context, id int64) error {
	_, err := r.Queries.Plans_DeleteById(ctx, id)
	if err != nil {
		return err
	}
	return nil
}