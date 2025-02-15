package repository

import (
	"backend/db"
	"context"
)

type PlansRepository struct {
	Queries *db.Queries
}

func (r *PlansRepository) GetPlansByUserId(ctx context.Context, userId int64, limit int) ([]db.Plan, error) {
	plans, err := r.Queries.Plans_GetByUserId(ctx, db.Plans_GetByUserIdParams{UserID: userId, Limit: 100})
	if err != nil {
		return nil, err
	}
	return plans, nil
}

func (r *PlansRepository) CreatePlan(ctx context.Context, name string, description string, userId int64) (*db.Plan, error) {
	plan, err := r.Queries.Plans_CreateOne(ctx, db.Plans_CreateOneParams{Name: name, Description: description, UserID: userId})
	if err != nil {
		return nil, err
	}
	return &plan, nil
}

func (r *PlansRepository) UpdatePlan(ctx context.Context, id int64, name string, description string) (*db.Plan, error) {
	plan, err := r.Queries.Plans_UpdateOne(ctx, db.Plans_UpdateOneParams{
		ID:          id,
		Name:        name,
		Description: description,
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