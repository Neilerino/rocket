package handlers

import (
	"backend/db"
	"backend/db/repository"
	api_utils "backend/internal/api/utils"
	"backend/internal/types"
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
	Description string `json:"description,omitempty" default:""`
}

// Helper function to convert DB PlanInterval to API PlanInterval
func dbPlanIntervalToApiPlanInterval(dbInterval db.PlanIntervals_ListRow) (types.PlanInterval, error) {
	pgInterval := types.NewPostgreSQLInterval(dbInterval.Duration)

	return types.PlanInterval{
		ID:          dbInterval.ID,
		PlanID:      dbInterval.PlanID,
		Duration:    pgInterval,
		Name:        dbInterval.Name.String,
		Description: dbInterval.Description.String,
		Order:       dbInterval.Order,
		CreatedAt:   dbInterval.CreatedAt.Time.String(),
		UpdatedAt:   dbInterval.UpdatedAt.Time.String(),
		GroupCount:  int(dbInterval.GroupCount),
	}, nil
}

// Helper function to convert slice of DB PlanIntervals to API PlanIntervals
func dbPlanIntervalsToApiPlanIntervals(dbIntervals []db.PlanIntervals_ListRow) ([]types.PlanInterval, error) {
	result := make([]types.PlanInterval, len(dbIntervals))
	for i, dbInterval := range dbIntervals {
		apiInterval, err := dbPlanIntervalToApiPlanInterval(dbInterval)
		if err != nil {
			return nil, err
		}
		result[i] = apiInterval
	}
	return result, nil
}

// Helper function to convert simple DB PlanInterval to API PlanInterval (for Create/Delete operations)
func dbPlanIntervalSimpleToApiPlanInterval(dbInterval db.PlanInterval, groupCount int) (types.PlanInterval, error) {
	pgInterval := types.NewPostgreSQLInterval(dbInterval.Duration)

	return types.PlanInterval{
		ID:          dbInterval.ID,
		PlanID:      dbInterval.PlanID,
		Duration:    pgInterval,
		Name:        dbInterval.Name.String,
		Description: dbInterval.Description.String,
		Order:       dbInterval.Order,
		CreatedAt:   dbInterval.CreatedAt.Time.String(),
		UpdatedAt:   dbInterval.UpdatedAt.Time.String(),
		GroupCount:  groupCount,
	}, nil
}

// handleListPlanIntervals is a shared handler function for both List and GetById endpoints
func (h *PlanIntervalHandler) List(w http.ResponseWriter, r *http.Request) {
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
		// Create repository directly - no service layer needed
		plan_interval_repo := repository.PlanIntervalsRepository{Queries: queries}

		log.Printf("Calling repository.ListPlanIntervals with planId=%d, intervalId=%d, limit=%d", planId, intervalId, limit)
		dbPlanIntervals, err := plan_interval_repo.ListPlanIntervals(r.Context(), planId, intervalId, int32(limit))
		if err != nil {
			log.Printf("Error from ListPlanIntervals: %v", err)
			return err
		}

		// Convert DB plan intervals to API plan intervals
		apiPlanIntervals, err := dbPlanIntervalsToApiPlanIntervals(dbPlanIntervals)
		if err != nil {
			log.Printf("Error converting plan intervals: %v", err)
			return err
		}

		log.Printf("Successfully retrieved plan intervals, count: %d", len(apiPlanIntervals))

		// If we're expecting a single result but got none, return a 404
		if len(apiPlanIntervals) == 0 {
			log.Printf("Plan interval not found")
			api_utils.WriteError(w, http.StatusNotFound, "Plan interval not found")
			return nil
		}

		w.Header().Set("Content-Type", "application/json")

		// Otherwise return the whole array
		return json.NewEncoder(w).Encode(apiPlanIntervals)
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
		// Create repository directly - no service layer needed
		plan_interval_repo := repository.PlanIntervalsRepository{Queries: queries}

		log.Printf("Calling repository.CreatePlanInterval")
		dbPlanInterval, err := plan_interval_repo.CreatePlanInterval(r.Context(), args.PlanId, args.Duration, args.Name, args.Order, args.Description)
		if err != nil {
			log.Printf("Error from CreatePlanInterval: %v", err)
			return err
		}

		// Convert DB plan interval to API plan interval
		apiPlanInterval, err := dbPlanIntervalSimpleToApiPlanInterval(*dbPlanInterval, 0)
		if err != nil {
			log.Printf("Error converting plan interval: %v", err)
			return err
		}

		log.Printf("Successfully created plan interval with ID: %d", apiPlanInterval.ID)
		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(apiPlanInterval)
	})

	if success {
		w.WriteHeader(http.StatusCreated)
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
		// Create repository directly - no service layer needed
		plan_interval_repo := repository.PlanIntervalsRepository{Queries: queries}

		log.Printf("Calling repository.DeletePlanInterval with ID: %d", planIntervalId)
		_, err := plan_interval_repo.DeletePlanInterval(r.Context(), planIntervalId)
		if err != nil {
			log.Printf("Error from DeletePlanInterval: %v", err)
			return err
		}

		log.Printf("Successfully deleted plan interval with ID: %d", planIntervalId)
		return nil
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}
