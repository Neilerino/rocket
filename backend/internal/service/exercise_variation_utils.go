package service

import (
	"backend/db"
	"backend/internal/types"
)

func ExerciseVariationRowToApi(rows []db.ExerciseVariations_ListWithDetailsRow) []types.ExerciseVariation {
	variationsMap := make(map[int64]*types.ExerciseVariation)

	for _, row := range rows {
		variation, exists := variationsMap[row.ID]

		if !exists {
			variation = &types.ExerciseVariation{
				ID:         row.ID,
				ExerciseId: row.ExerciseID,
				Exercise: types.Exercise{
					ID:          row.EID,
					Name:        row.EName,
					Description: row.EDescription,
					UserID:      row.EUserID.Int64,
					CreatedAt:   row.ECreatedAt.Time.String(),
					UpdatedAt:   row.EUpdatedAt.Time.String(),
				},
			}
			variationsMap[row.ID] = variation
		}

		if row.EvpID.Valid {
			param := types.ExerciseVariationParam{
				ID:                  row.EvpID.Int64,
				ExerciseVariationId: row.ID,
				Locked:              row.Locked.Bool,
				ParameterTypeId:     row.PtID.Int64,
				ParameterType: types.ParameterType{
					ID:          row.PtID.Int64,
					Name:        row.PtName.String,
					DataType:    row.PtDataType.String,
					DefaultUnit: row.PtDefaultUnit.String,
					MinValue:    row.PtMinValue.Float64,
					MaxValue:    row.PtMaxValue.Float64,
				},
			}
			if variationsMap[row.ID].Parameters == nil {
				variationsMap[row.ID].Parameters = []types.ExerciseVariationParam{}
			}
			variation.Parameters = append(variation.Parameters, param)
		}
	}

	variations := make([]types.ExerciseVariation, 0, len(variationsMap))
	for _, variation := range variationsMap {
		variations = append(variations, *variation)
	}

	return variations
}
