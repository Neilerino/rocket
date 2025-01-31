package cmd

import (
	"backend/db"
	"backend/internal/config"
	"fmt"
	"log"
	"os"
)

func Migrate() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	db, err := db.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	if err := db.InitializeTables(); err != nil {
		fmt.Printf("Error initializing tables: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Successfully initialized database tables")
}
