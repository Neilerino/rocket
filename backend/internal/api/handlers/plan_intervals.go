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

type PlanIntervalHandler struct {
	Db *db.Database
}

type ListPlanIntervalsResponse struct {
	Items      []interface{} `json:"items"`
	TotalCount int           `json:"totalCount"`
}

type ListPlanIntervalsApiArgs struct {
	PlanId     int64  `json:"planId,omitempty"`
	IntervalId int64  `json:"intervalId,omitempty"`
	Limit      *int32 `json:"limit,omitempty"`
}

type CreatePlanIntervalApiArgs struct {
	PlanId      int64  `json:"planId"`
	Duration    string `json:"duration"`
	Name        string `json:"name"`
	Order       int32  `json:"order"`
	Description string `json:"description"`
}

// handleListPlanIntervals is a shared handler function for both List and GetById endpoints
func (h *PlanIntervalHandler) List(w http.ResponseWriter, r *http.Request) {
	// Create a filter parser with logging enabled
	filterParser := api_utils.NewFilterParser(r, true)

	// Use the new non-nullable filter methods with default values
	planId := filterParser.GetIntFilterOrZero("planId")
	intervalId := filterParser.GetIntFilterOrZero("id")

	// Check if at least one filter is provided
	if planId == 0 && intervalId == 0 {
		api_utils.WriteError(w, http.StatusBadRequest, "Missing required field: planId or id")
		return
	}

	// Get limit from query params
	limit := filterParser.GetLimit(100)

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		plan_interval_repo := repository.PlanIntervalsRepository{Queries: queries}
		plan_interval_service := service.NewPlanIntervalsService(&plan_interval_repo)

		log.Printf("Calling service.ListPlanIntervals with planId=%d, intervalId=%d, limit=%d", planId, intervalId, limit)
		plan_intervals, err := plan_interval_service.ListPlanIntervals(r.Context(), planId, intervalId, int32(limit))
		if err != nil {
			log.Printf("Error from ListPlanIntervals: %v", err)
			return err
		}

		if plan_intervals != nil {
			log.Printf("Successfully retrieved plan intervals, count: %d", len(plan_intervals))
		}

		// If we're expecting a single result but got none, return a 404
		if len(plan_intervals) == 0 {
			log.Printf("Plan interval not found")
			api_utils.WriteError(w, http.StatusNotFound, "Plan interval not found")
			return nil
		}

		w.Header().Set("Content-Type", "application/json")

		// Otherwise return the whole array
		return json.NewEncoder(w).Encode(plan_intervals)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *PlanIntervalHandler) Create(w http.ResponseWriter, r *http.Request) {
	// Log the incoming request for debugging
	log.Printf("Handling plan intervals Create request: %s %s", r.Method, r.URL.String())

	// Decode the request body
	var args CreatePlanIntervalApiArgs
	if err := json.NewDecoder(r.Body).Decode(&args); err != nil {
		log.Printf("Error decoding request body: %v", err)
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Log the request arguments
	log.Printf("Create plan interval request: planId=%d, name='%s', duration='%s', order=%d",
		args.PlanId, args.Name, args.Duration, args.Order)

	// Validate required fields
	if args.PlanId == 0 {
		api_utils.WriteError(w, http.StatusBadRequest, "Missing required field: planId")
		return
	}
	if args.Name == "" {
		api_utils.WriteError(w, http.StatusBadRequest, "Missing required field: name")
		return
	}
	if args.Duration == "" {
		api_utils.WriteError(w, http.StatusBadRequest, "Missing required field: duration")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		plan_interval_repo := repository.PlanIntervalsRepository{Queries: queries}
		plan_interval_service := service.NewPlanIntervalsService(&plan_interval_repo)

		log.Printf("Calling service.CreatePlanInterval")
		plan_interval, err := plan_interval_service.CreatePlanInterval(r.Context(), args.PlanId, args.Duration, args.Name, args.Order, args.Description)
		if err != nil {
			log.Printf("Error from CreatePlanInterval: %v", err)
			return err
		}

		log.Printf("Successfully created plan interval with ID: %d", plan_interval.ID)
		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(plan_interval)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *PlanIntervalHandler) Update(w http.ResponseWriter, r *http.Request) {
	// Log the incoming request for debugging
	log.Printf("Handling plan intervals Update request: %s %s", r.Method, r.URL.String())

	// Parse the intervalId from the URL path
	intervalId, err := api_utils.ParseBigInt(chi.URLParam(r, "id"))
	if err != nil {
		log.Printf("Error parsing intervalId: %v", err)
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid interval ID")
		return
	}

	// For now, just return a not implemented response
	log.Printf("Update not implemented for interval ID: %d", intervalId)
	api_utils.WriteError(w, http.StatusNotImplemented, "Update operation not yet implemented")
}

func (h *PlanIntervalHandler) Delete(w http.ResponseWriter, r *http.Request) {
	// Log the incoming request for debugging
	log.Printf("Handling plan intervals Delete request: %s %s", r.Method, r.URL.String())

	// Parse the planIntervalId from the URL path
	planIntervalId, err := api_utils.ParseBigInt(chi.URLParam(r, "id"))
	if err != nil {
		log.Printf("Error parsing planIntervalId: %v", err)
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid plan interval ID")
		return
	}

	log.Printf("Deleting plan interval with ID: %d", planIntervalId)

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		plan_interval_repo := repository.PlanIntervalsRepository{Queries: queries}
		plan_interval_service := service.NewPlanIntervalsService(&plan_interval_repo)

		log.Printf("Calling service.DeletePlanInterval with ID: %d", planIntervalId)
		_, err := plan_interval_service.DeletePlanInterval(r.Context(), planIntervalId)
		if err != nil {
			log.Printf("Error from DeletePlanInterval: %v", err)
			return err
		}

		log.Printf("Successfully deleted plan interval with ID: %d", planIntervalId)
		return nil
	})

	if success {
		// Return a successful response with an empty JSON object
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{})
	}
}
