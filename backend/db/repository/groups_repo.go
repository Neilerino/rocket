package repository

import (
	"backend/db"
	"context"
)

type GroupsRepository struct {
	Queries *db.Queries
}

type GroupListParams struct {
	PlanId     int64
	GroupId    int64
	IntervalId int64
	UserId     int64
	Offset     int32
	Limit      int32
}

func NewGroupsRepository(queries *db.Queries) *GroupsRepository {
	return &GroupsRepository{Queries: queries}
}

func (r *GroupsRepository) ListGroups(ctx context.Context, params GroupListParams) ([]db.Group, error) {
	return r.Queries.Groups_List(ctx, db.Groups_ListParams{PlanID: params.PlanId, GroupID: params.GroupId, IntervalID: params.IntervalId, UserID: params.UserId, Limit: params.Limit, Offset: params.Offset})
}

func (r *GroupsRepository) GetByUserId(ctx context.Context, userId int64, limit int) ([]db.Group, error) {
	groups, err := r.Queries.Groups_GetByUserId(ctx, db.Groups_GetByUserIdParams{UserID: userId, Limit: 100})
	if err != nil {
		return nil, err
	}
	return groups, nil
}

func (r *GroupsRepository) GetGroupById(ctx context.Context, id int64) (*db.Group, error) {
	group, err := r.Queries.Groups_GetById(ctx, id)
	if err != nil {
		return nil, err
	}
	return &group, nil
}

func (r *GroupsRepository) GetByPlanId(ctx context.Context, planId int64, limit int) ([]db.Group, error) {
	rows, err := r.Queries.Groups_GetByPlanId(ctx, db.Groups_GetByPlanIdParams{PlanID: planId, Limit: 100})
	if err != nil {
		return nil, err
	}
	var groups []db.Group
	for _, row := range rows {
		groups = append(groups, db.Group{
			ID:          row.ID,
			Name:        row.Name,
			Description: row.Description,
			UserID:      row.UserID,
			CreatedAt:   row.CreatedAt,
			UpdatedAt:   row.UpdatedAt,
		})
	}

	return groups, nil
}

func (r *GroupsRepository) Create(ctx context.Context, name string, description string, userId int64) (*db.Group, error) {
	group, err := r.Queries.Groups_CreateOne(ctx, db.Groups_CreateOneParams{Name: name, Description: description, UserID: userId})
	if err != nil {
		return nil, err
	}
	return &group, nil
}

func (r *GroupsRepository) Update(ctx context.Context, id int64, name string, description string) (*db.Group, error) {
	group, err := r.Queries.Groups_UpdateOne(ctx, db.Groups_UpdateOneParams{ID: id, Name: name, Description: description})
	if err != nil {
		return nil, err
	}
	return &group, nil
}

func (r *GroupsRepository) Delete(ctx context.Context, id int64) (*db.Group, error) {
	group, err := r.Queries.Groups_DeleteById(ctx, id)
	if err != nil {
		return nil, err
	}
	return &group, nil
}
