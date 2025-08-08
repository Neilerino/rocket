package handlers

import (
	"backend/db"
	"backend/db/repository"
	api_utils "backend/internal/api/utils"
	"backend/internal/types"
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type ExerciseVariationsHandler struct {
	Db *db.Database
}

type CreateExerciseParameterTypeApiArgs struct {
	ParameterTypeId int64   `json:"parameterTypeId,omitempty"`
	Name            string  `json:"name,omitempty"`        // Parameter type name
	DataType        string  `json:"dataType,omitempty"`    // e.g., "percentage", "length", "time", "weight"
	DefaultUnit     string  `json:"defaultUnit,omitempty"` // e.g., "%", "mm", "seconds", "kg"
	MinValue        float64 `json:"minValue,omitempty"`
	MaxValue        float64 `json:"maxValue,omitempty"`
	Locked          bool    `json:"locked"`
}

// ToServiceParams converts the API arguments to service parameters
// Helper function to convert DB ExerciseVariation rows to API ExerciseVariations
func dbExerciseVariationRowsToApiExerciseVariations(rows []db.ExerciseVariations_ListWithDetailsRow) []types.ExerciseVariation {
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

type CreateExerciseVariationApiArgs struct {
	Name           string                               `json:"name"`
	ParameterTypes []CreateExerciseParameterTypeApiArgs `json:"parameterTypes"`
}

// Helper struct for repository parameter type creation
type CreateExerciseParameterTypeRepoParams struct {
	ParameterTypeId *int64
	Name            *string
	DataType        *string
	DefaultUnit     *string
	MinValue        *float64
	MaxValue        *float64
	Locked          bool
}

// Convert API args to repository params
func (args *CreateExerciseParameterTypeApiArgs) ToRepoParams() CreateExerciseParameterTypeRepoParams {
	var paramTypeId *int64
	var name, dataType, defaultUnit *string
	var minValue, maxValue *float64

	// Only set pointers for non-zero values
	if args.ParameterTypeId != 0 {
		paramTypeId = &args.ParameterTypeId
	}
	if args.Name != "" {
		name = &args.Name
	}
	if args.DataType != "" {
		dataType = &args.DataType
	}
	if args.DefaultUnit != "" {
		defaultUnit = &args.DefaultUnit
	}
	if args.MinValue != 0 {
		minValue = &args.MinValue
	}
	if args.MaxValue != 0 {
		maxValue = &args.MaxValue
	}

	return CreateExerciseParameterTypeRepoParams{
		ParameterTypeId: paramTypeId,
		Name:            name,
		DataType:        dataType,
		DefaultUnit:     defaultUnit,
		MinValue:        minValue,
		MaxValue:        maxValue,
		Locked:          args.Locked,
	}
}

func (h *ExerciseVariationsHandler) List(w http.ResponseWriter, r *http.Request) {
	filterParser := api_utils.NewFilterParser(r, true)

	// Get filters with defaults
	exerciseId := filterParser.GetIntFilterOrZero("exerciseId")
	userId := filterParser.GetIntFilterOrZero("userId")
	planId := filterParser.GetIntFilterOrZero("planId")
	groupId := filterParser.GetIntFilterOrZero("groupId")
	planIntervalId := filterParser.GetIntFilterOrZero("intervalId")
	variationId := filterParser.GetIntFilterOrZero("variationId")

	// Check if at least one filter is provided
	if exerciseId == 0 && userId == 0 && planId == 0 && groupId == 0 && planIntervalId == 0 && variationId == 0 {
		api_utils.WriteError(w, http.StatusBadRequest, "Missing at least one filter parameter")
		return
	}

	// Get limit and offset from query params
	limit := filterParser.GetLimit(100)
	offset := filterParser.GetIntFilterOrZero("offset")

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		// Create repository directly - no service layer needed
		variationRepo := repository.NewExerciseVariationsRepository(queries)

		log.Printf("Calling variationRepo.List with exerciseId=%d, userId=%d, planId=%d, groupId=%d, intervalId=%d, limit=%d, offset=%d",
			exerciseId, userId, planId, groupId, planIntervalId, limit, offset)

		// Convert single values to slices for the repository layer
		exerciseIds := []int64{}
		if exerciseId != 0 {
			exerciseIds = []int64{exerciseId}
		}
		planIds := []int64{}
		if planId != 0 {
			planIds = []int64{planId}
		}
		groupIds := []int64{}
		if groupId != 0 {
			groupIds = []int64{groupId}
		}
		intervalIds := []int64{}
		if planIntervalId != 0 {
			intervalIds = []int64{planIntervalId}
		}
		variationIds := []int64{}
		if variationId != 0 {
			variationIds = []int64{variationId}
		}

		params := repository.ExerciseVariationListParams{
			ExerciseId:     exerciseIds,
			UserId:         userId,
			PlanId:         planIds,
			GroupId:        groupIds,
			PlanIntervalId: intervalIds,
			VariationId:    variationIds,
			Limit:          int32(limit),
			Offset:         int32(offset),
		}

		dbVariations, err := variationRepo.List(r.Context(), params)
		if err != nil {
			log.Printf("Error retrieving exercise variations: %v", err)
			return err
		}

		// Convert DB variations to API variations
		apiVariations := dbExerciseVariationRowsToApiExerciseVariations(dbVariations)

		log.Printf("Successfully retrieved exercise variations, count: %d", len(apiVariations))

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(apiVariations)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *ExerciseVariationsHandler) Create(w http.ResponseWriter, r *http.Request) {
	var args CreateExerciseVariationApiArgs
	if err := json.NewDecoder(r.Body).Decode(&args); err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	exerciseId, err := api_utils.ParseBigInt(chi.URLParam(r, "exerciseId"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid exercise ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		// Create repositories directly - no service layer needed
		variationRepo := repository.NewExerciseVariationsRepository(queries)
		exerciseRepo := repository.NewExercisesRepository(queries)
		parameterTypesRepo := repository.NewParameterTypesRepository(queries)

		// Check if exercise exists
		exercise, err := exerciseRepo.GetExerciseById(r.Context(), exerciseId)
		if err != nil {
			return err
		}
		if exercise == nil {
			return errors.New("exercise not found")
		}

		// Create the exercise variation
		exerciseVariation, err := variationRepo.CreateExerciseVariation(r.Context(), exerciseId, args.Name)
		if err != nil {
			return err
		}

		// Add parameter types to the variation
		for _, parameterTypeArg := range args.ParameterTypes {
			repoParams := parameterTypeArg.ToRepoParams()
			
			if repoParams.ParameterTypeId != nil {
				// Use existing parameter type
				_, err = variationRepo.AddParam(r.Context(), exerciseVariation.ID, *repoParams.ParameterTypeId, repoParams.Locked)
				if err != nil {
					return err
				}
			} else {
				// Create new parameter type
				newParamType, err := parameterTypesRepo.Create(r.Context(), repository.CreateParameterTypeParams{
					Name:        repoParams.Name,
					DataType:    repoParams.DataType,
					DefaultUnit: repoParams.DefaultUnit,
					MinValue:    repoParams.MinValue,
					MaxValue:    repoParams.MaxValue,
				})
				if err != nil {
					return err
				}
				_, err = variationRepo.AddParam(r.Context(), exerciseVariation.ID, newParamType.ID, repoParams.Locked)
				if err != nil {
					return err
				}
			}
		}

		log.Printf("Successfully created variation with ID: %d", exerciseVariation.ID)

		// Get the complete variation with details to return
		dbVariations, err := variationRepo.List(r.Context(), repository.ExerciseVariationListParams{
			VariationId: []int64{exerciseVariation.ID},
			Limit:       1,
		})
		if err != nil {
			return err
		}

		if len(dbVariations) == 0 {
			return errors.New("variation not found")
		}

		// Convert to API format
		apiVariations := dbExerciseVariationRowsToApiExerciseVariations(dbVariations)
		if len(apiVariations) == 0 {
			return errors.New("variation conversion failed")
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(apiVariations[0])
	})

	if success {
		w.WriteHeader(http.StatusCreated)
	}
}

func (h *ExerciseVariationsHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := api_utils.ParseBigInt(chi.URLParam(r, "id"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid variation ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		// Create repository directly - no service layer needed
		variationRepo := repository.NewExerciseVariationsRepository(queries)
		return variationRepo.DeleteOne(r.Context(), id)
	})

	if success {
		w.WriteHeader(http.StatusNoContent)
	}
}
