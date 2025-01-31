package handlers

import (
	"backend/db"
	"backend/db/repository"
	api_utils "backend/internal/api/utils"
	"backend/internal/service"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type PlanIntervalHandler struct {
	Db *db.Database
}

type ListPlanIntervalsApiArgs struct {
	PlanId int64
}

type CreatePlanIntervalApiArgs struct {
	PlanId int64
	Duration string
	Name string 
	Order int32
}

func (h *PlanIntervalHandler) List(w http.ResponseWriter, r *http.Request) {
	planId, err := api_utils.ParseBigInt(chi.URLParam(r, "planId"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid plan ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		plan_interval_repo := repository.PlanIntervalsRepository{Queries: queries}
		plan_interval_service := service.NewPlanIntervalsService(&plan_interval_repo)

		plan_intervals, err := plan_interval_service.GetPlanIntervalByPlanId(r.Context(), planId, 100)
		if err != nil {
			return err
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(plan_intervals)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *PlanIntervalHandler) Create(w http.ResponseWriter, r *http.Request) {
	var args CreatePlanIntervalApiArgs
	if err := json.NewDecoder(r.Body).Decode(&args); err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		plan_interval_repo := repository.PlanIntervalsRepository{Queries: queries}
		plan_interval_service := service.NewPlanIntervalsService(&plan_interval_repo)

		plan_interval, err := plan_interval_service.CreatePlanInterval(r.Context(), args.PlanId, args.Duration, args.Name, args.Order)
		if err != nil {
			return err
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(plan_interval)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *PlanIntervalHandler) Delete(w http.ResponseWriter, r *http.Request) {
	planIntervalId, err := api_utils.ParseBigInt(chi.URLParam(r, "planIntervalId"))

	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid plan interval ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		plan_interval_repo := repository.PlanIntervalsRepository{Queries: queries}
		plan_interval_service := service.NewPlanIntervalsService(&plan_interval_repo)

		_, err := plan_interval_service.DeletePlanInterval(r.Context(), planIntervalId)
		if err != nil {
			return err
		}

		return nil
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}