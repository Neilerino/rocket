package repository

import (
	"backend/db"
	"backend/internal/types"
	"context"
)

type IntervalGroupAssignmentsRepository struct {
	Queries *db.Queries
}

func (r *IntervalGroupAssignmentsRepository) GetByIntervalId(ctx context.Context, intervalId int64) ([]types.IntervalGroupAssignment, error) {
	rows, err := r.Queries.IntervalGroupAssignments_GetByIntervalId(ctx, intervalId)
	if err != nil {
		return nil, err
	}

	assignments := make([]types.IntervalGroupAssignment, len(rows))
	for i, row := range rows {
		assignments[i] = types.IntervalGroupAssignment{
			ID:             row.ID,
			PlanIntervalId: row.PlanIntervalID,
			GroupId:        row.GroupID,
			Frequency:      row.Frequency,
			Group: &types.Group{
				ID:          row.GID,
				Name:        row.GName,
				Description: row.GDescription,
				UserID:      row.GUserID,
				CreatedAt:   row.GCreatedAt.Time.String(),
				UpdatedAt:   row.GUpdatedAt.Time.String(),
			},
		}
	}

	return assignments, nil
}

func (r *IntervalGroupAssignmentsRepository) GetByGroupId(ctx context.Context, groupId int64) ([]types.IntervalGroupAssignment, error) {
	rows, err := r.Queries.IntervalGroupAssignments_GetByGroupId(ctx, groupId)
	if err != nil {
		return nil, err
	}

	assignments := make([]types.IntervalGroupAssignment, len(rows))
	for i, row := range rows {
		assignments[i] = types.IntervalGroupAssignment{
			ID:             row.ID,
			PlanIntervalId: row.PlanIntervalID,
			GroupId:        row.GroupID,
			Frequency:      row.Frequency,
			PlanInterval: &types.PlanInterval{
				ID:        row.PiID,
				PlanID:    row.PiPlanID,
				Name:      row.PiName.String,
				Duration:  row.PiDuration.Microseconds,
				Order:     row.PiOrder,
				CreatedAt: row.PiCreatedAt.Time.String(),
				UpdatedAt: row.PiUpdatedAt.Time.String(),
			},
		}
	}

	return assignments, nil
}

func (r *IntervalGroupAssignmentsRepository) CreateOne(ctx context.Context, assignment types.IntervalGroupAssignment) (*types.IntervalGroupAssignment, error) {
	row, err := r.Queries.IntervalGroupAssignments_Create(ctx, db.IntervalGroupAssignments_CreateParams{
		PlanIntervalID: assignment.PlanIntervalId,
		GroupID:        assignment.GroupId,
		Frequency:      assignment.Frequency,
	})
	if err != nil {
		return nil, err
	}

	return &types.IntervalGroupAssignment{
		ID:             row.ID,
		PlanIntervalId: row.PlanIntervalID,
		GroupId:        row.GroupID,
		Frequency:      row.Frequency,
	}, nil
}

func (r *IntervalGroupAssignmentsRepository) DeleteOne(ctx context.Context, planIntervalId int64, groupId int64) error {
	return r.Queries.IntervalGroupAssignments_Delete(ctx, db.IntervalGroupAssignments_DeleteParams{
		PlanIntervalID: planIntervalId,
		GroupID:        groupId,
	})
}