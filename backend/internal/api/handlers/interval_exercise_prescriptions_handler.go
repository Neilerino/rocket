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

type IntervalExercisePrescriptionsHandler struct {
	Db *db.Database
}

type CreateIntervalExercisePrescriptionApiArgs struct {
	GroupId            int64   `json:"group_id"`
	ExerciseVariationId int64   `json:"exercise_variation_id"`
	PlanIntervalId     int64   `json:"plan_interval_id"`
	RPE                float64 `json:"rpe"`
	Sets               int32   `json:"sets"`
	Reps               int32   `json:"reps"`
	Duration           int32   `json:"duration"`
	Rest               int32   `json:"rest"`
}

func (h *IntervalExercisePrescriptionsHandler) ListByGroupId(w http.ResponseWriter, r *http.Request) {
	groupId, err := api_utils.ParseBigInt(chi.URLParam(r, "groupId"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid group ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		prescription_repo := repository.IntervalExercisePrescriptionsRepository{Queries: queries}
		prescription_service := service.NewIntervalExercisePrescriptionsService(&prescription_repo)

		prescriptions, err := prescription_service.GetByGroupId(r.Context(), groupId)
		if err != nil {
			return err
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(prescriptions)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *IntervalExercisePrescriptionsHandler) ListByPlanIntervalId(w http.ResponseWriter, r *http.Request) {
	planIntervalId, err := api_utils.ParseBigInt(chi.URLParam(r, "planIntervalId"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid plan interval ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		prescription_repo := repository.IntervalExercisePrescriptionsRepository{Queries: queries}
		prescription_service := service.NewIntervalExercisePrescriptionsService(&prescription_repo)

		prescriptions, err := prescription_service.GetByPlanIntervalId(r.Context(), planIntervalId)
		if err != nil {
			return err
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(prescriptions)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *IntervalExercisePrescriptionsHandler) Create(w http.ResponseWriter, r *http.Request) {
	var args CreateIntervalExercisePrescriptionApiArgs
	if err := json.NewDecoder(r.Body).Decode(&args); err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		prescription_repo := repository.IntervalExercisePrescriptionsRepository{Queries: queries}
		prescription_service := service.NewIntervalExercisePrescriptionsService(&prescription_repo)

		prescription := types.IntervalExercisePrescription{
			GroupId:            args.GroupId,
			ExerciseVariationId: args.ExerciseVariationId,
			PlanIntervalId:     args.PlanIntervalId,
			RPE:                args.RPE,
			Sets:               args.Sets,
			Reps:               args.Reps,
			Duration:           args.Duration,
			Rest:               args.Rest,
		}

		created, err := prescription_service.CreateOne(r.Context(), prescription)
		if err != nil {
			return err
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(created)
	})

	if success {
		w.WriteHeader(http.StatusCreated)
	}
}

func (h *IntervalExercisePrescriptionsHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := api_utils.ParseBigInt(chi.URLParam(r, "id"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid prescription ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		prescription_repo := repository.IntervalExercisePrescriptionsRepository{Queries: queries}
		prescription_service := service.NewIntervalExercisePrescriptionsService(&prescription_repo)

		if err := prescription_service.DeleteOne(r.Context(), id); err != nil {
			return err
		}

		return nil
	})

	if success {
		w.WriteHeader(http.StatusNoContent)
	}
}
