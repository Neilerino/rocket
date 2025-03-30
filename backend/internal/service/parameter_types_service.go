package service

import (
	"backend/db"
	"backend/db/repository"
	"backend/internal/types"
	"context"
)

type ParameterTypesService struct {
	repo *repository.ParameterTypesRepository
}

type ListParameterTypesParams struct {
	UserId          *int64
	ParameterTypeId *int64
	Offset          int32
	Limit           int32
}

type CreateParameterTypeParams struct {
	Name        *string
	DataType    *string
	DefaultUnit *string
	MinValue    *float64
	MaxValue    *float64
}

func NewParameterTypesService(queries *db.Queries) *ParameterTypesService {
	return &ParameterTypesService{repo: repository.NewParameterTypesRepository(queries)}
}

func (s *ParameterTypesService) List(ctx context.Context, params ListParameterTypesParams) ([]types.ParameterType, error) {
	rows, err := s.repo.List(ctx, repository.ListParameterTypesParams{
		UserId:          DerefOrDefault(params.UserId, 0),
		ParameterTypeId: DerefOrDefault(params.ParameterTypeId, 0),
		Offset:          params.Offset,
		Limit:           params.Limit,
	})
	if err != nil {
		return nil, err
	}

	var result []types.ParameterType
	for _, row := range rows {
		result = append(result, types.ParameterType{
			ID:          row.ID,
			Name:        row.Name,
			DataType:    row.DataType,
			DefaultUnit: row.DefaultUnit,
			MinValue:    row.MinValue.Float64,
			MaxValue:    row.MaxValue.Float64,
		})
	}
	return result, nil
}

func (s *ParameterTypesService) Create(ctx context.Context, params CreateParameterTypeParams) (*types.ParameterType, error) {
	row, err := s.repo.Create(ctx, repository.CreateParameterTypeParams{
		Name:        DerefOrDefault(params.Name, ""),
		DataType:    DerefOrDefault(params.DataType, ""),
		DefaultUnit: DerefOrDefault(params.DefaultUnit, ""),
		MinValue:    DerefOrDefault(params.MinValue, 0.0),
		MaxValue:    DerefOrDefault(params.MaxValue, 0.0),
	})
	if err != nil {
		return nil, err
	}
	return &types.ParameterType{
		ID:          row.ID,
		Name:        row.Name,
		DataType:    row.DataType,
		DefaultUnit: row.DefaultUnit,
		MinValue:    row.MinValue.Float64,
		MaxValue:    row.MaxValue.Float64,
	}, nil
}
