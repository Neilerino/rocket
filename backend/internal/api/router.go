package api

import (
	"backend/db"
	"backend/internal/api/handlers"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func NewRouter(db *db.Database) *chi.Mux {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)

	healthHandler := &handlers.HealthHandler{}
	planHandler := &handlers.PlanHandler{Db: db}

	r.Get("/health", healthHandler.Health)

	// Routes
	r.Route("/api/v1", func(r chi.Router) {
		r.Route("/plans", func(r chi.Router) {
			r.Get("/{userId}", planHandler.List)
			r.Post("/", planHandler.Create)
		})
	})

	return r
}
