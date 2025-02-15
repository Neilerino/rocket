package api

import (
	"backend/db"
	"backend/internal/api/handlers"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func NewRouter(db *db.Database) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/api/v1", func(r chi.Router) {
		// Plans
		plans_handler := &handlers.PlanHandler{Db: db}
		r.Route("/plans", func(r chi.Router) {
			r.Post("/", plans_handler.Create)
			r.Get("/{id}", plans_handler.GetById)
			r.Put("/{id}", plans_handler.Edit)
			r.Delete("/{id}", plans_handler.Delete)
			r.Get("/user/{userId}", plans_handler.List)
		})

		// Groups
		groups_handler := &handlers.GroupsHandler{Db: db}
		r.Route("/groups", func(r chi.Router) {
			r.Get("/plan/{planId}", groups_handler.ListByPlanId)
			r.Post("/", groups_handler.Create)
			r.Get("/{id}", groups_handler.GetById)
			r.Put("/{id}", groups_handler.Update)
			r.Delete("/{id}", groups_handler.Delete)
			// Group interval assignment
			r.Post("/{groupId}/assign/{intervalId}", groups_handler.AssignToInterval)
			r.Delete("/{groupId}/assign/{intervalId}", groups_handler.RemoveFromInterval)
		})

		// Exercises
		exercises_handler := &handlers.ExercisesHandler{Db: db}
		r.Route("/exercises", func(r chi.Router) {
			r.Get("/", exercises_handler.ListByUserId)
			r.Post("/", exercises_handler.Create)
			r.Get("/{id}", exercises_handler.GetById)
			r.Put("/{id}", exercises_handler.Update)
			r.Delete("/{id}", exercises_handler.Delete)
		})

		// Exercise Variations
		exercise_variations_handler := &handlers.ExerciseVariationsHandler{Db: db}
		r.Route("/exercise-variations", func(r chi.Router) {
			r.Get("/exercise/{exerciseId}", exercise_variations_handler.ListByExerciseId)
			r.Get("/{id}", exercise_variations_handler.GetById)
			r.Post("/", exercise_variations_handler.Create)
			r.Delete("/{id}", exercise_variations_handler.Delete)
		})

		// Interval Exercise Prescriptions
		interval_exercise_prescriptions_handler := &handlers.IntervalExercisePrescriptionsHandler{Db: db}
		r.Route("/interval-exercise-prescriptions", func(r chi.Router) {
			r.Get("/group/{groupId}", interval_exercise_prescriptions_handler.ListByGroupId)
			r.Get("/plan-interval/{planIntervalId}", interval_exercise_prescriptions_handler.ListByPlanIntervalId)
			r.Post("/", interval_exercise_prescriptions_handler.Create)
			r.Delete("/{id}", interval_exercise_prescriptions_handler.Delete)
		})
	})

	return r
}
