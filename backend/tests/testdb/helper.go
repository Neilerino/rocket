package testdb

import (
	"context"
	_ "embed"
	"fmt"
	"time"

	"backend/db"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

//go:embed fixtures/seed_data.sql
var seedDataSQL string

// loadSeedData reads the embedded seed data SQL file
func loadSeedData() (string, error) {
	return seedDataSQL, nil
}

const (
	// Test database configuration
	TestDBName = "rocket_test"
	TestDBUser = "test_user"
	TestDBPass = "test_password"
	
	// Container configuration
	PostgresImage = "postgres:15-alpine"
	ContainerStartTimeout = 60 * time.Second
)

// TestDatabase wraps the database and container for testing
type TestDatabase struct {
	DB        *db.Database
	Container *postgres.PostgresContainer
	ConnStr   string
}

// SetupTestDB creates a new PostgreSQL testcontainer, applies schema, and returns configured database
func SetupTestDB(ctx context.Context) (*TestDatabase, error) {
	// Create PostgreSQL container with simplified configuration
	container, err := postgres.Run(ctx,
		PostgresImage,
		postgres.WithDatabase(TestDBName),
		postgres.WithUsername(TestDBUser),
		postgres.WithPassword(TestDBPass),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(ContainerStartTimeout),
		),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to start postgres container: %w", err)
	}

	// Get connection string
	connStr, err := container.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		return nil, fmt.Errorf("failed to get connection string: %w", err)
	}

	// Initialize database connection using your existing setup
	database, err := db.Initialize(connStr)
	if err != nil {
		// Cleanup container on database initialization failure
		if termErr := container.Terminate(ctx); termErr != nil {
			return nil, fmt.Errorf("failed to initialize database: %w, failed to cleanup container: %v", err, termErr)
		}
		return nil, fmt.Errorf("failed to initialize database: %w", err)
	}

	// Apply database schema using your existing method
	if err := database.InitializeTables(); err != nil {
		database.Close()
		if termErr := container.Terminate(ctx); termErr != nil {
			return nil, fmt.Errorf("failed to initialize tables: %w, failed to cleanup container: %v", err, termErr)
		}
		return nil, fmt.Errorf("failed to initialize tables: %w", err)
	}

	return &TestDatabase{
		DB:        database,
		Container: container,
		ConnStr:   connStr,
	}, nil
}

// SeedTestData loads test data into the database
func (td *TestDatabase) SeedTestData(ctx context.Context) error {
	// Read seed data SQL file
	seedSQL, err := loadSeedData()
	if err != nil {
		return fmt.Errorf("failed to load seed data: %w", err)
	}

	// Execute seed data in transaction
	tx, err := td.DB.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to start seed transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Execute the seed SQL
	if _, err := tx.Exec(ctx, seedSQL); err != nil {
		return fmt.Errorf("failed to execute seed data: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit seed transaction: %w", err)
	}

	return nil
}

// CleanupTestDB properly closes database connection and terminates container
func (td *TestDatabase) CleanupTestDB(ctx context.Context) error {
	var errs []error

	// Close database connection
	if td.DB != nil {
		td.DB.Close()
	}

	// Terminate container
	if td.Container != nil {
		if err := td.Container.Terminate(ctx); err != nil {
			errs = append(errs, fmt.Errorf("failed to terminate container: %w", err))
		}
	}

	// Return combined errors if any
	if len(errs) > 0 {
		return fmt.Errorf("cleanup errors: %v", errs)
	}

	return nil
}

// Reset clears all data from tables while preserving schema
func (td *TestDatabase) Reset(ctx context.Context) error {
	// Get list of all tables to truncate (in dependency order)
	truncateQueries := []string{
		"TRUNCATE TABLE interval_exercise_prescriptions CASCADE",
		"TRUNCATE TABLE exercise_variation_params CASCADE", 
		"TRUNCATE TABLE exercise_variations CASCADE",
		"TRUNCATE TABLE interval_group_assignments CASCADE",
		"TRUNCATE TABLE plan_intervals CASCADE",
		"TRUNCATE TABLE exercises CASCADE",
		"TRUNCATE TABLE groups CASCADE", 
		"TRUNCATE TABLE plans CASCADE",
		"TRUNCATE TABLE parameter_types CASCADE",
		"TRUNCATE TABLE users CASCADE",
	}

	// Execute truncate queries in transaction
	tx, err := td.DB.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	for _, query := range truncateQueries {
		if _, err := tx.Exec(ctx, query); err != nil {
			return fmt.Errorf("failed to execute truncate query %q: %w", query, err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit truncate transaction: %w", err)
	}

	return nil
}

// ResetAndSeed clears all data and reloads fresh test data - perfect for test isolation
func (td *TestDatabase) ResetAndSeed(ctx context.Context) error {
	// First reset all data
	if err := td.Reset(ctx); err != nil {
		return fmt.Errorf("failed to reset database: %w", err)
	}

	// Then seed fresh test data
	if err := td.SeedTestData(ctx); err != nil {
		return fmt.Errorf("failed to seed test data after reset: %w", err)
	}

	return nil
}

// GetQueries returns a new Queries instance for database operations
func (td *TestDatabase) GetQueries() *db.Queries {
	return &db.Queries{}
}

// Health checks if the test database is healthy and responsive
func (td *TestDatabase) Health(ctx context.Context) error {
	tx, err := td.DB.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to start health check transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Simple query to verify database is responsive
	var result int
	if err := tx.QueryRow(ctx, "SELECT 1").Scan(&result); err != nil {
		return fmt.Errorf("health check query failed: %w", err)
	}

	if result != 1 {
		return fmt.Errorf("health check returned unexpected result: %d", result)
	}

	return tx.Commit(ctx)
}