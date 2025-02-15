package handlers

import (
	"backend/db"
	"backend/db/repository"
	api_utils "backend/internal/api/utils"
	"backend/internal/service"
	"backend/internal/types"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type ExerciseVariationsHandler struct {
	Db *db.Database
}

type CreateExerciseVariationApiArgs struct {
	ExerciseId    int64  `json:"exercise_id"`
	Name          string `json:"name"`           // Parameter type name
	DataType      string `json:"data_type"`      // e.g., "percentage", "length", "time", "weight"
	DefaultUnit   string `json:"default_unit"`   // e.g., "%", "mm", "seconds", "kg"
	MinValue      float64 `json:"min_value,omitempty"`
	MaxValue      float64 `json:"max_value,omitempty"`
	ParameterTypeId int64 `json:"parameter_type_id"`
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

func (h *ExerciseVariationsHandler) GetById(w http.ResponseWriter, r *http.Request) {
	id, err := api_utils.ParseBigInt(chi.URLParam(r, "id"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid variation ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		variation_repo := repository.ExerciseVariationsRepository{Queries: queries}
		variation_service := service.NewExerciseVariationsService(&variation_repo)

		variation, err := variation_service.GetById(r.Context(), id)
		if err != nil {
			return err
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(variation)
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

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		variation_repo := repository.ExerciseVariationsRepository{Queries: queries}
		variation_service := service.NewExerciseVariationsService(&variation_repo)

		parameterType := types.ParameterType{
			Name:        args.Name,
			DataType:    args.DataType,
			DefaultUnit: args.DefaultUnit,
			MinValue:    args.MinValue,
			MaxValue:    args.MaxValue,
		}

		variation, err := variation_service.CreateOne(r.Context(), args.ExerciseId, parameterType)
		if err != nil {
			return err
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(variation)
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
