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

type PlanHandler struct {
	Db *db.Database
}

type ListPlanApiArgs struct {
	UserId int64
}

type CreatePlanApiArgs struct {
	Name        string
	Description string
	UserId      int64
}
	

func (h *PlanHandler) List(w http.ResponseWriter, r *http.Request) {
	userId, err := api_utils.ParseBigInt(chi.URLParam(r, "userId"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		plan_repo := repository.PlansRepository{Queries: queries}
		plan_service := service.NewPlansService(&plan_repo)

		plans, err := plan_service.GetPlanByUserId(r.Context(), userId, 100)
		if err != nil {
			return err
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(plans)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *PlanHandler) Create(w http.ResponseWriter, r *http.Request) {
	var args CreatePlanApiArgs
	if err := json.NewDecoder(r.Body).Decode(&args); err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		plan_repo := repository.PlansRepository{Queries: queries}
		plan_service := service.NewPlansService(&plan_repo)

		plan, err := plan_service.CreatePlan(r.Context(), args.Name, args.Description, args.UserId)
		if err != nil {
			return err
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(plan)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *PlanHandler) Edit(w http.ResponseWriter, r *http.Request) {

}
