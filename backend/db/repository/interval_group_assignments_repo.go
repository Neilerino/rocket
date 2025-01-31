package repository

import (
	"backend/db"
	"context"
)

type IntervalGroupAssignmentRepository struct {
	Queries *db.Queries
}

func (r *IntervalGroupAssignmentRepository) Create(ctx context.Context, planIntervalId int64, groupId int64) (db.IntervalGroupAssignment, error) {
	assignment, err := r.Queries.IntervalGroupAssignment_CreateOne(ctx, db.IntervalGroupAssignment_CreateOneParams{PlanIntervalID: planIntervalId, GroupID: groupId})
	if err != nil {
		return db.IntervalGroupAssignment{}, err
	}
	return assignment, nil
}

func (r *IntervalGroupAssignmentRepository) Delete(ctx context.Context, planIntervalId int64, groupId int64) (db.IntervalGroupAssignment, error) {
	assignment, err := r.Queries.IntervalGroupAssignment_DeleteByKey(ctx, db.IntervalGroupAssignment_DeleteByKeyParams{PlanIntervalID: planIntervalId, GroupID: groupId})
	if err != nil {
		return db.IntervalGroupAssignment{}, err
	}
	return assignment, nil
}