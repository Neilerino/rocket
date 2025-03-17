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
			ID:                  row.EvpID,
			ExerciseVariationId: row.ID,
			Locked:              row.Locked,
			ParameterTypeId:     row.PtID,
			ParameterType: types.ParameterType{
				ID:          row.PtID,
				Name:        row.PtName,
				DataType:    row.PtDataType,
				DefaultUnit: row.PtDefaultUnit,
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
