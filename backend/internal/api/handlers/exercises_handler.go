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

type ExercisesHandler struct {
	Db *db.Database
}

type CreateExerciseApiArgs struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	UserId      int64  `json:"userId"`
}

type UpdateExerciseApiArgs struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// Helper function to convert DB Exercise to API Exercise
func dbExerciseToApiExercise(dbExercise db.Exercise) types.Exercise {
	return types.Exercise{
		ID:          dbExercise.ID,
		Name:        dbExercise.Name,
		Description: dbExercise.Description,
		UserID:      dbExercise.UserID.Int64,
		CreatedAt:   dbExercise.CreatedAt.Time.String(),
		UpdatedAt:   dbExercise.UpdatedAt.Time.String(),
	}
}

// Helper function to convert slice of DB Exercises to API Exercises
func dbExercisesToApiExercises(dbExercises []db.Exercise) []types.Exercise {
	result := make([]types.Exercise, len(dbExercises))
	for i, dbExercise := range dbExercises {
		result[i] = dbExerciseToApiExercise(dbExercise)
	}
	return result
}

func (h *ExercisesHandler) ListByUserId(w http.ResponseWriter, r *http.Request) {
	userId, err := api_utils.ParseBigInt(chi.URLParam(r, "userId"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		// Create repository directly - no service layer needed
		exercise_repo := repository.ExercisesRepository{Queries: queries}

		dbExercises, err := exercise_repo.GetExercisesByUserId(r.Context(), userId, 100)
		if err != nil {
			return err
		}

		// Convert DB exercises to API exercises
		apiExercises := dbExercisesToApiExercises(dbExercises)

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(apiExercises)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *ExercisesHandler) GetById(w http.ResponseWriter, r *http.Request) {
	id, err := api_utils.ParseBigInt(chi.URLParam(r, "id"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid exercise ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		// Create repository directly - no service layer needed
		exercise_repo := repository.ExercisesRepository{Queries: queries}

		dbExercise, err := exercise_repo.GetExerciseById(r.Context(), id)
		if err != nil {
			return err
		}

		// Convert DB exercise to API exercise
		apiExercise := dbExerciseToApiExercise(*dbExercise)

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(apiExercise)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *ExercisesHandler) Create(w http.ResponseWriter, r *http.Request) {
	var args CreateExerciseApiArgs
	if err := json.NewDecoder(r.Body).Decode(&args); err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		// Create repository directly - no service layer needed
		exercise_repo := repository.ExercisesRepository{Queries: queries}

		dbExercise, err := exercise_repo.CreateExercise(r.Context(), args.Name, args.Description, args.UserId)
		if err != nil {
			return err
		}

		// Convert DB exercise to API exercise
		apiExercise := dbExerciseToApiExercise(*dbExercise)

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(apiExercise)
	})

	if success {
		w.WriteHeader(http.StatusCreated)
	}
}

func (h *ExercisesHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := api_utils.ParseBigInt(chi.URLParam(r, "id"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid exercise ID")
		return
	}

	var args UpdateExerciseApiArgs
	if err := json.NewDecoder(r.Body).Decode(&args); err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		// Create repository directly - no service layer needed
		exercise_repo := repository.ExercisesRepository{Queries: queries}

		dbExercise, err := exercise_repo.UpdateExercise(r.Context(), id, args.Name, args.Description)
		if err != nil {
			return err
		}

		// Convert DB exercise to API exercise
		apiExercise := dbExerciseToApiExercise(*dbExercise)

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(apiExercise)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *ExercisesHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := api_utils.ParseBigInt(chi.URLParam(r, "id"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid exercise ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		// Create repository directly - no service layer needed
		exercise_repo := repository.ExercisesRepository{Queries: queries}

		if err := exercise_repo.DeleteExercise(r.Context(), id); err != nil {
			return err
		}

		return nil
	})

	if success {
		w.WriteHeader(http.StatusNoContent)
	}
}

func (h *ExercisesHandler) List(w http.ResponseWriter, r *http.Request) {
	filterParser := api_utils.NewFilterParser(r, true)

	// Get filters with defaults
	exerciseId := filterParser.GetIntFilterOrZero("id")
	userId := filterParser.GetIntFilterOrZero("userId")
	planId := filterParser.GetIntFilterOrZero("planId")
	groupId := filterParser.GetIntFilterOrZero("groupId")
	intervalId := filterParser.GetIntFilterOrZero("intervalId")

	// Check if at least one filter is provided
	if exerciseId == 0 && userId == 0 && planId == 0 && groupId == 0 && intervalId == 0 {
		api_utils.WriteError(w, http.StatusBadRequest, "Missing at least one filter parameter")
		return
	}

	// Get limit from query params
	limit := filterParser.GetLimit(100)

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		// Create repository directly - no service layer needed
		exercise_repo := repository.ExercisesRepository{Queries: queries}

		log.Printf("Calling ListExercises with exerciseId=%d, userId=%d, planId=%d, groupId=%d, intervalId=%d, limit=%d", 
			exerciseId, userId, planId, groupId, intervalId, limit)
		
		params := repository.ExerciseListParams{
			ExerciseID: exerciseId,
			UserID:     userId,
			PlanID:     planId,
			GroupID:    groupId,
			IntervalID: intervalId,
			Limit:      int32(limit),
		}
		
		dbExercises, err := exercise_repo.ListExercises(r.Context(), params)
		if err != nil {
			log.Printf("Error retrieving exercises: %v", err)
			return err
		}

		// Convert DB exercises to API exercises
		apiExercises := dbExercisesToApiExercises(dbExercises)

		log.Printf("Successfully retrieved exercises")
		
		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(apiExercises)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}
