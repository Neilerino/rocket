package api

import (
	"backend/db"
	"backend/internal/api/handlers"
	"backend/internal/api/middleware"
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func NewRouter(db *db.Database) http.Handler {
	r := chi.NewRouter()

	// Basic middleware
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)

	// Setup CORS - must be before our response middleware
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://dev.rocket:5173", "http://localhost:5173", "http://127.0.0.1:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	// Add our response middleware to standardize all API responses
	// This must be after CORS middleware to avoid header duplication
	r.Use(middleware.ResponseMiddleware)

	r.Route("/api/v1", func(r chi.Router) {
		// Plans
		plans_handler := &handlers.PlanHandler{Db: db}
		r.Route("/plans", func(r chi.Router) {
			r.Get("/", plans_handler.List)
			r.Post("/", plans_handler.Create)
			r.Get("/{id}", plans_handler.GetById)
			r.Put("/{id}", plans_handler.Edit)
			r.Delete("/{id}", plans_handler.Delete)
		})

		// Plan Intervals
		interval_handler := &handlers.PlanIntervalHandler{Db: db}
		r.Route("/intervals", func(r chi.Router) {
			r.Get("/", interval_handler.List)
			r.Post("/", interval_handler.Create)
			r.Put("/{id}", interval_handler.Update)
			r.Delete("/{id}", interval_handler.Delete)
		})

		// Groups
		groups_handler := &handlers.GroupsHandler{Db: db}
		r.Route("/groups", func(r chi.Router) {
			r.Get("/", groups_handler.List)
			r.Post("/", groups_handler.Create)
			r.Put("/{id}", groups_handler.Update)
			r.Delete("/{id}", groups_handler.Delete)
			// Group interval assignment
			r.Post("/{groupId}/assign/{intervalId}", groups_handler.AssignToInterval)
			r.Delete("/{groupId}/assign/{intervalId}", groups_handler.RemoveFromInterval)
		})

		// Exercises
		exercises_handler := &handlers.ExercisesHandler{Db: db}
		exercise_variations_handler := &handlers.ExerciseVariationsHandler{Db: db}
		r.Route("/exercises", func(r chi.Router) {
			r.Get("/", exercises_handler.List)
			r.Post("/", exercises_handler.Create)
			r.Put("/{id}", exercises_handler.Update)
			r.Delete("/{id}", exercises_handler.Delete)
			r.Post("/{exerciseId}/create-variation", exercise_variations_handler.Create)
		})

		// Exercise Variations
		r.Route("/exercise-variations", func(r chi.Router) {
			r.Get("/", exercise_variations_handler.List)
			r.Delete("/{id}", exercise_variations_handler.Delete)
		})

		//Parameter Types
		parameter_types_handler := &handlers.ParameterTypesHandler{Db: db}
		r.Route("/parameter-types", func(r chi.Router) {
			r.Get("/", parameter_types_handler.List)
		})

		//Interval Exercise Prescriptions
		interval_exercise_prescriptions_handler := &handlers.IntervalExercisePrescriptionsHandler{Db: db}
		r.Route("/interval-exercise-prescriptions", func(r chi.Router) {
			r.Get("/", interval_exercise_prescriptions_handler.List)
			r.Post("/", interval_exercise_prescriptions_handler.Create)
			// r.Delete("/{id}", interval_exercise_prescriptions_handler.Delete)
		})
	})

	return r
}
