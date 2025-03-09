package cmd

import (
	"log"
	"net/http"

	"backend/db"
	"backend/internal/api"
	"backend/internal/config"

	"github.com/rs/cors"
)

func Server() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	db, err := db.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Create router
	router := api.NewRouter(db)

	// Start server
	log.Printf("Starting server on port %s", cfg.Port)

	handler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://dev.rocket:5173", "http://localhost:5173", "http://127.0.0.1:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Api-Version", "x-api-version"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
		Debug:            true, // Enable debugging for troubleshooting
	}).Handler(router)

	server := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: handler,
	}

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
