package repository

import (
	"backend/db"
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

type ParameterTypesRepository struct {
	Queries *db.Queries
}

type CreateParameterTypeParams struct {
	Name        string
	DataType    string
	DefaultUnit string
	MinValue    float64
	MaxValue    float64
}

type ListParameterTypesParams struct {
	UserId          int64
	ParameterTypeId int64
	Offset          int32
	Limit           int32
}

func NewParameterTypesRepository(queries *db.Queries) *ParameterTypesRepository {
	return &ParameterTypesRepository{Queries: queries}
}

func (r *ParameterTypesRepository) Create(ctx context.Context, params CreateParameterTypeParams) (db.ParameterType, error) {
	return r.Queries.ParameterTypes_CreateOne(ctx, db.ParameterTypes_CreateOneParams{
		Name:        params.Name,
		DataType:    params.DataType,
		DefaultUnit: params.DefaultUnit,
		MinValue:    pgtype.Float8{Float64: params.MinValue, Valid: true},
		MaxValue:    pgtype.Float8{Float64: params.MaxValue, Valid: true},
	})
}

func (r *ParameterTypesRepository) List(ctx context.Context, params ListParameterTypesParams) ([]db.ParameterTypes_ListRow, error) {
	return r.Queries.ParameterTypes_List(ctx, db.ParameterTypes_ListParams{
		UserID:          params.UserId,
		ParameterTypeID: params.ParameterTypeId,
		Offset:          params.Offset,
		Limit:           params.Limit,
	})
}
