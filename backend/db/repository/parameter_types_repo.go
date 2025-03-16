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
