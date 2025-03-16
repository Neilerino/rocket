package handlers

import (
	"backend/db"
	"backend/db/repository"
	api_utils "backend/internal/api/utils"
	"backend/internal/service"
	"encoding/json"
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

type CreateExerciseVariationApiArgs struct {
	ParameterTypes []CreateExerciseParameterTypeApiArgs `json:"parameterTypes"`
}

func (h *ExerciseVariationsHandler) List(w http.ResponseWriter, r *http.Request) {
	filterParser := api_utils.NewFilterParser(r, true)

	// Get filters with defaults
	exerciseId := filterParser.GetIntFilterOrZero("exerciseId")
	userId := filterParser.GetIntFilterOrZero("userId")
	planId := filterParser.GetIntFilterOrZero("planId")
	groupId := filterParser.GetIntFilterOrZero("groupId")
	planIntervalId := filterParser.GetIntFilterOrZero("intervalId")

	// Check if at least one filter is provided
	if exerciseId == 0 && userId == 0 && planId == 0 && groupId == 0 && planIntervalId == 0 {
		api_utils.WriteError(w, http.StatusBadRequest, "Missing at least one filter parameter")
		return
	}

	// Get limit and offset from query params
	limit := filterParser.GetLimit(100)
	offset := filterParser.GetIntFilterOrZero("offset")

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		variation_repo := repository.ExerciseVariationsRepository{Queries: queries}
		variation_service := service.NewExerciseVariationsService(&variation_repo)

		log.Printf("Calling variation_service.List with exerciseId=%d, userId=%d, planId=%d, groupId=%d, intervalId=%d, limit=%d, offset=%d",
			exerciseId, userId, planId, groupId, planIntervalId, limit, offset)

		params := service.ExerciseVariationListParams{
			ExerciseId:     exerciseId,
			UserId:         userId,
			PlanId:         planId,
			GroupId:        groupId,
			PlanIntervalId: planIntervalId,
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

func (h *ExerciseVariationsHandler) ListByExerciseId(w http.ResponseWriter, r *http.Request) {
	exerciseId, err := api_utils.ParseBigInt(chi.URLParam(r, "exerciseId"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid exercise ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		variation_repo := repository.ExerciseVariationsRepository{Queries: queries}
		variation_service := service.NewExerciseVariationsService(&variation_repo)

		variations, err := variation_service.GetByExerciseId(r.Context(), exerciseId)
		if err != nil {
			return err
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(variations)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *ExerciseVariationsHandler) CreateVariation(w http.ResponseWriter, r *http.Request) {
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
		variation_repo := repository.ExerciseVariationsRepository{Queries: queries}
		exercise_repo := repository.ExercisesRepository{Queries: queries}
		variation_service := service.NewExerciseVariationsService(&variation_repo, &exercise_repo)

	// 	variation_repo := repository.ExerciseVariationsRepository{Queries: queries}
	// 	variation_service := service.NewExerciseVariationsService(&variation_repo)

	// 	parameterType := types.ParameterType{
	// 		Name:        args.Name,
	// 		DataType:    args.DataType,
	// 		DefaultUnit: args.DefaultUnit,
	// 		MinValue:    args.MinValue,
	// 		MaxValue:    args.MaxValue,
	// 	}

	// 	variation, err := variation_service.CreateOne(r.Context(), args.ExerciseId, parameterType)
	// 	if err != nil {
	// 		return err
	// 	}

	// 	w.Header().Set("Content-Type", "application/json")
	// 	return json.NewEncoder(w).Encode(variation)
	// })

	// if success {
	// w.WriteHeader(http.StatusCreated)
	// }
}

func (h *ExerciseVariationsHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := api_utils.ParseBigInt(chi.URLParam(r, "id"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid variation ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		variation_repo := repository.ExerciseVariationsRepository{Queries: queries}
		variation_service := service.NewExerciseVariationsService(&variation_repo)

		if err := variation_service.DeleteOne(r.Context(), id); err != nil {
			return err
		}

		return nil
	})

	if success {
		w.WriteHeader(http.StatusNoContent)
	}
}
