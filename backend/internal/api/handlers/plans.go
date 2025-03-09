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

type PlanHandler struct {
	Db *db.Database
}

type ListPlansResponse struct {
	Items      []interface{} `json:"items"`
	TotalCount int           `json:"totalCount"`
	NextCursor string        `json:"nextCursor,omitempty"`
}

type ListPlanApiArgs struct {
	UserId     *int64  `json:"userId,omitempty"`
	Id         *int64  `json:"id,omitempty"`
	Limit      *int32  `json:"limit,omitempty"`
	Cursor     *string `json:"cursor,omitempty"`
	IsTemplate *bool   `json:"isTemplate,omitempty"`
	IsPublic   *bool   `json:"isPublic,omitempty"`
}

type CreatePlanApiArgs struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	UserId      int64  `json:"userId"`
	IsTemplate  bool   `json:"isTemplate"`
	IsPublic    bool   `json:"isPublic"`
}

func (h *PlanHandler) List(w http.ResponseWriter, r *http.Request) {
	// Log the incoming request for debugging
	log.Printf("Handling plans List request: %s %s", r.Method, r.URL.String())
	log.Printf("Query params: %v", r.URL.Query())

	// Create a filter parser with logging enabled
	filterParser := api_utils.NewFilterParser(r, true)

	// Get filters from query params
	userId := filterParser.GetIntFilter("userId")
	planId := filterParser.GetIntFilter("id")

	// Require at least one filter (userId or planId)
	if userId == nil && planId == nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Missing required filter: either userId or planId must be provided")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		plan_repo := repository.PlansRepository{Queries: queries}
		plan_service := service.NewPlansService(&plan_repo)

		// Get limit and offset from query params
		limit := filterParser.GetLimit(100)
		offset := filterParser.GetOffset(0)

		// Get boolean filters
		isTemplate := filterParser.GetBoolFilter("isTemplate")
		isPublic := filterParser.GetBoolFilter("isPublic")

		// Log the filters being applied
		if isTemplate != nil {
			log.Printf("Filtering plans by isTemplate=%v", *isTemplate)
		}
		if isPublic != nil {
			log.Printf("Filtering plans by isPublic=%v", *isPublic)
		}

		// Use the more flexible GetPlans method that can handle both userId and planId filters
		log.Printf("Filtering plans with userId=%v, planId=%v, limit=%d, offset=%d", userId, planId, int(limit), offset)

		// Prepare the arguments for the service call
		args := service.ListPlanArgs{
			UserId:     userId,
			PlanId:     planId,
			Limit:      limit,
			Offset:     int32(offset),
			IsTemplate: isTemplate,
			IsPublic:   isPublic,
		}

		// Call the service to get plans based on the provided filters
		plans, err := plan_service.GetPlans(r.Context(), args)
		if err != nil {
			log.Printf("Error from GetPlans: %v", err)
			return err
		}

		if plans != nil {
			log.Printf("Successfully retrieved plans, count: %d", len(*plans))
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(plans)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *PlanHandler) Create(w http.ResponseWriter, r *http.Request) {
	// Log the incoming request for debugging
	log.Printf("Handling plans Create request: %s %s", r.Method, r.URL.String())

	var args CreatePlanApiArgs
	if err := json.NewDecoder(r.Body).Decode(&args); err != nil {
		log.Printf("Error decoding request body: %v", err)
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate required fields
	if args.Name == "" {
		log.Printf("Error: Missing name parameter")
		api_utils.WriteError(w, http.StatusBadRequest, "Missing required field: name")
		return
	}

	if args.UserId <= 0 {
		log.Printf("Error: Invalid or missing userId parameter: %d", args.UserId)
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid or missing userId")
		return
	}

	log.Printf("Creating plan with name=%s, userId=%d, isTemplate=%v, isPublic=%v",
		args.Name, args.UserId, args.IsTemplate, args.IsPublic)

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		plan_repo := repository.PlansRepository{Queries: queries}
		plan_service := service.NewPlansService(&plan_repo)

		// Call service to create plan
		plan, err := plan_service.CreatePlan(
			r.Context(),
			args.Name,
			args.Description,
			args.UserId,
			args.IsTemplate,
			args.IsPublic,
		)
		if err != nil {
			log.Printf("Error creating plan: %v", err)
			return err
		}

		log.Printf("Successfully created plan with ID: %d", plan.ID)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		return json.NewEncoder(w).Encode(plan)
	})

	if !success {
		// Error already handled by WithTransaction
		return
	}
}

// GetById is kept for backward compatibility with existing clients
// New clients should use the List endpoint with planId parameter
func (h *PlanHandler) GetById(w http.ResponseWriter, r *http.Request) {
	id, err := api_utils.ParseBigInt(chi.URLParam(r, "id"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid plan ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		plan_repo := repository.PlansRepository{Queries: queries}
		plan_service := service.NewPlansService(&plan_repo)

		plan, err := plan_service.GetByPlanId(r.Context(), id)
		if err != nil {
			return err
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		return json.NewEncoder(w).Encode(plan)
	})

	if !success {
		// Error already handled by WithTransaction
		return
	}
}

func (h *PlanHandler) Edit(w http.ResponseWriter, r *http.Request) {
	// Log the incoming request for debugging
	log.Printf("Handling plans Edit request: %s %s", r.Method, r.URL.String())

	id, err := api_utils.ParseBigInt(chi.URLParam(r, "id"))
	if err != nil {
		log.Printf("Error parsing plan ID: %v", err)
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid plan ID")
		return
	}
	log.Printf("Editing plan with ID: %d", id)

	var args CreatePlanApiArgs
	if err := json.NewDecoder(r.Body).Decode(&args); err != nil {
		log.Printf("Error decoding request body: %v", err)
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate required fields
	if args.Name == "" {
		log.Printf("Error: Missing name parameter")
		api_utils.WriteError(w, http.StatusBadRequest, "Missing required field: name")
		return
	}

	log.Printf("Updating plan with name=%s, isTemplate=%v, isPublic=%v",
		args.Name, args.IsTemplate, args.IsPublic)

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		plan_repo := repository.PlansRepository{Queries: queries}
		plan_service := service.NewPlansService(&plan_repo)

		// Call service to update plan
		plan, err := plan_service.UpdatePlan(
			r.Context(),
			id,
			args.Name,
			args.Description,
			args.IsTemplate,
			args.IsPublic,
		)
		if err != nil {
			log.Printf("Error updating plan: %v", err)
			return err
		}

		log.Printf("Successfully updated plan with ID: %d", plan.ID)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		return json.NewEncoder(w).Encode(plan)
	})

	if !success {
		// Error already handled by WithTransaction
		return
	}
}

func (h *PlanHandler) Delete(w http.ResponseWriter, r *http.Request) {
	// Log the incoming request for debugging
	log.Printf("Handling plans Delete request: %s %s", r.Method, r.URL.String())

	id, err := api_utils.ParseBigInt(chi.URLParam(r, "id"))
	if err != nil {
		log.Printf("Error parsing plan ID: %v", err)
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid plan ID")
		return
	}
	log.Printf("Deleting plan with ID: %d", id)

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		plan_repo := repository.PlansRepository{Queries: queries}
		plan_service := service.NewPlansService(&plan_repo)

		if err := plan_service.DeletePlan(r.Context(), id); err != nil {
			log.Printf("Error deleting plan: %v", err)
			return err
		}

		log.Printf("Successfully deleted plan with ID: %d", id)
		return nil
	})

	if success {
		w.WriteHeader(http.StatusNoContent)
	}
}
