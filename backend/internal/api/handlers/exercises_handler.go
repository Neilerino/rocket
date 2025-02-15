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

func (h *ExercisesHandler) ListByUserId(w http.ResponseWriter, r *http.Request) {
	userId, err := api_utils.ParseBigInt(chi.URLParam(r, "userId"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		exercise_repo := repository.ExercisesRepository{Queries: queries}
		exercise_service := service.NewExercisesService(&exercise_repo)

		exercises, err := exercise_service.GetExercisesByUserId(r.Context(), userId, 100)
		if err != nil {
			return err
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(exercises)
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
		exercise_repo := repository.ExercisesRepository{Queries: queries}
		exercise_service := service.NewExercisesService(&exercise_repo)

		exercise, err := exercise_service.GetExerciseById(r.Context(), id)
		if err != nil {
			return err
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(exercise)
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
		exercise_repo := repository.ExercisesRepository{Queries: queries}
		exercise_service := service.NewExercisesService(&exercise_repo)

		exercise, err := exercise_service.CreateExercise(r.Context(), args.Name, args.Description, args.UserId)
		if err != nil {
			return err
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(exercise)
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
		exercise_repo := repository.ExercisesRepository{Queries: queries}
		exercise_service := service.NewExercisesService(&exercise_repo)

		exercise, err := exercise_service.UpdateExercise(r.Context(), id, args.Name, args.Description)
		if err != nil {
			return err
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(exercise)
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
		exercise_repo := repository.ExercisesRepository{Queries: queries}
		exercise_service := service.NewExercisesService(&exercise_repo)

		if err := exercise_service.DeleteExercise(r.Context(), id); err != nil {
			return err
		}

		return nil
	})

	if success {
		w.WriteHeader(http.StatusNoContent)
	}
}
