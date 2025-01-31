package service

import (
	"backend/db/repository"
	"backend/internal/types"
	"context"
)

type GroupsService struct {
	repo *repository.GroupsRepository
}

func NewGroupsService(repo *repository.GroupsRepository) *GroupsService {
	return &GroupsService{repo: repo}
}

func (s *GroupsService) GetGroupsByPlanId(ctx context.Context, userId int64, limit int) (*[]types.Group, error) {
	groups, err := s.repo.GetByUserId(ctx, userId, limit)
	if err != nil {
		return nil, err
	}

	var result []types.Group
	for _, group := range groups {
		result = append(result, types.Group{
			ID:          group.ID,
			Name:        group.Name,
			Description: group.Description,
			UserID:      group.UserID,
			CreatedAt:   group.CreatedAt.Time.String(),
			UpdatedAt:   group.UpdatedAt.Time.String(),
		})
	}
	return &result, nil
}

func (s *GroupsService) CreateGroup(ctx context.Context, name string, description string, userId int64) (*types.Group, error) {
	group, err := s.repo.Create(ctx, name, description, userId)
	if err != nil {
		return nil, err
	}

	return &types.Group{
		ID:          group.ID,
		Name:        group.Name,
		Description: group.Description,
		UserID:      group.UserID,
		CreatedAt:   group.CreatedAt.Time.String(),
		UpdatedAt:   group.UpdatedAt.Time.String(),
	}, nil
}

func (s *GroupsService) UpdateGroup(ctx context.Context, id int64, name string, description string) (*types.Group, error) {
	group, err := s.repo.Update(ctx, id, name, description)
	if err != nil {
		return nil, err
	}

	return &types.Group{
		ID:          group.ID,
		Name:        group.Name,
		Description: group.Description,
		UserID:      group.UserID,
		CreatedAt:   group.CreatedAt.Time.String(),
		UpdatedAt:   group.UpdatedAt.Time.String(),
	}, nil
}

func (s *GroupsService) DeleteGroup(ctx context.Context, id int64) (*types.Group, error) {
	group, err := s.repo.Delete(ctx, id)
	if err != nil {
		return nil, err
	}

	return &types.Group{
		ID:          group.ID,
		Name:        group.Name,
		Description: group.Description,
		UserID:      group.UserID,
		CreatedAt:   group.CreatedAt.Time.String(),
		UpdatedAt:   group.UpdatedAt.Time.String(),
	}, nil
}
