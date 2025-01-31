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
		AllowedOrigins: []string{"http://*.rocket:5173"}}).Handler(router)

	server := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: handler,
	}

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
