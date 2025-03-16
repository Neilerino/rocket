package handlers

import (
	"backend/db"
	api_utils "backend/internal/api/utils"
	"backend/internal/service"
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
func (args *CreateExerciseParameterTypeApiArgs) ToServiceParams() service.CreateExerciseParameterTypeParams {
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

	return service.CreateExerciseParameterTypeParams{
		ParameterTypeId: paramTypeId,
		Name:            name,
		DataType:        dataType,
		DefaultUnit:     defaultUnit,
		MinValue:        minValue,
		MaxValue:        maxValue,
		Locked:          args.Locked,
	}
}

type CreateExerciseVariationApiArgs struct {
	Name           string                               `json:"name"`
	ParameterTypes []CreateExerciseParameterTypeApiArgs `json:"parameterTypes"`
}

func (args *CreateExerciseVariationApiArgs) ToServiceParams(exerciseId int64) service.ExerciseVariationCreateParams {
	parameterTypes := make([]service.CreateExerciseParameterTypeParams, len(args.ParameterTypes))
	for i, pt := range args.ParameterTypes {
		parameterTypes[i] = pt.ToServiceParams()
	}

	return service.ExerciseVariationCreateParams{
		ExerciseId:     exerciseId,
		ParameterTypes: parameterTypes,
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
		variation_service := service.NewExerciseVariationsService(queries)

		log.Printf("Calling variation_service.List with exerciseId=%d, userId=%d, planId=%d, groupId=%d, intervalId=%d, limit=%d, offset=%d",
			exerciseId, userId, planId, groupId, planIntervalId, limit, offset)

		params := service.ExerciseVariationListParams{
			ExerciseId:     exerciseId,
			UserId:         userId,
			PlanId:         planId,
			GroupId:        groupId,
			PlanIntervalId: planIntervalId,
			VariationId:    variationId,
			Limit:          int32(limit),
			Offset:         int32(offset),
		}

		variations, err := variation_service.List(r.Context(), params)
		if err != nil {
			log.Printf("Error retrieving exercise variations: %v", err)
			return err
		}

		log.Printf("Successfully retrieved exercise variations, count: %d", len(variations))

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(variations)
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
		variation_service := service.NewExerciseVariationsService(queries)

		variation_ret, err := variation_service.CreateVariation(r.Context(), exerciseId, args.ToServiceParams(exerciseId))
		if err != nil {
			return err
		}

		variations, err := variation_service.List(r.Context(), service.ExerciseVariationListParams{
			VariationId: variation_ret.ID,
			Limit:       1,
		})
		if err != nil {
			return err
		}

		if len(variations) == 0 {
			return errors.New("variation not found")
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(variations[0])
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
		variation_service := service.NewExerciseVariationsService(queries)
		return variation_service.DeleteOne(r.Context(), id)
	})

	if success {
		w.WriteHeader(http.StatusNoContent)
	}
}
