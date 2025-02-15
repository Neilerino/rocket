package repository

import (
	"backend/db"
	"context"
)

type IntervalGroupAssignmentRepository struct {
	Queries *db.Queries
}

func (r *IntervalGroupAssignmentRepository) Create(ctx context.Context, planIntervalId int64, groupId int64) (*db.IntervalGroupAssignment, error) {
	assignment, err := r.Queries.IntervalGroupAssignments_Create(ctx, db.IntervalGroupAssignments_CreateParams{
		PlanIntervalID: planIntervalId,
		GroupID:        groupId,
		Frequency:      1, // Default frequency of 1
	})
	if err != nil {
		return nil, err
	}
	return &assignment, nil
}

func (r *IntervalGroupAssignmentRepository) Delete(ctx context.Context, planIntervalId int64, groupId int64) (*db.IntervalGroupAssignment, error) {
	err := r.Queries.IntervalGroupAssignments_Delete(ctx, db.IntervalGroupAssignments_DeleteParams{
		PlanIntervalID: planIntervalId,
		GroupID:        groupId,
	})
	if err != nil {
		return nil, err
	}
	return nil, nil
}
