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
