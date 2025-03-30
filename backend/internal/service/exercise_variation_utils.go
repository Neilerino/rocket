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
				Parameters: []types.ExerciseVariationParam{},
			}
			variationsMap[row.ID] = variation
		}

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
		variation.Parameters = append(variation.Parameters, param)
	}

	variations := make([]types.ExerciseVariation, 0, len(variationsMap))
	for _, variation := range variationsMap {
		variations = append(variations, *variation)
	}

	return variations
}
