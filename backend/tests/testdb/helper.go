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
	PostgresImage         = "postgres:15-alpine"
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

func (td *TestDatabase) SeedTestData(ctx context.Context) error {
	seedSQL, err := loadSeedData()
	if err != nil {
		return fmt.Errorf("failed to load seed data: %w", err)
	}

	tx, err := td.DB.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to start seed transaction: %w", err)
	}

	if _, err := tx.Exec(ctx, seedSQL); err != nil {
		return fmt.Errorf("failed to execute seed data: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit seed transaction: %w", err)
	}

	return nil
}

func (td *TestDatabase) CleanupTestDB(ctx context.Context) error {
	var errs []error

	if td.Container != nil {
		terminateCtx, cancel := context.WithTimeout(ctx, 1*time.Second)
		defer cancel()

		if err := td.Container.Terminate(terminateCtx); err != nil {
			errs = append(errs, fmt.Errorf("failed to terminate container: %w", err))
		}
	}

	if len(errs) > 0 {
		return fmt.Errorf("cleanup errors: %v", errs)
	}

	return nil
}

func (td *TestDatabase) Reset(ctx context.Context) error {
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

	tx, err := td.DB.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}

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

func (td *TestDatabase) QuickReset(ctx context.Context) error {
	deleteQueries := []string{
		"DELETE FROM interval_exercise_prescriptions",
		"DELETE FROM exercise_variation_params",
		"DELETE FROM exercise_variations",
		"DELETE FROM interval_group_assignments",
		"DELETE FROM plan_intervals",
		"DELETE FROM exercises",
		"DELETE FROM groups",
		"DELETE FROM plans",
		"DELETE FROM parameter_types",
		"DELETE FROM users",
	}

	tx, err := td.DB.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}

	for _, query := range deleteQueries {
		if _, err := tx.Exec(ctx, query); err != nil {
			return fmt.Errorf("failed to execute delete query %q: %w", query, err)
		}
	}

	// Reset sequences to start from 1 again
	resetSequences := []string{
		"ALTER SEQUENCE users_id_seq RESTART WITH 1",
		"ALTER SEQUENCE plans_id_seq RESTART WITH 1",
		"ALTER SEQUENCE plan_intervals_id_seq RESTART WITH 1",
		"ALTER SEQUENCE groups_id_seq RESTART WITH 1",
		"ALTER SEQUENCE exercises_id_seq RESTART WITH 1",
		"ALTER SEQUENCE parameter_types_id_seq RESTART WITH 1",
		"ALTER SEQUENCE exercise_variations_id_seq RESTART WITH 1",
		"ALTER SEQUENCE exercise_variation_params_id_seq RESTART WITH 1",
		"ALTER SEQUENCE interval_group_assignments_id_seq RESTART WITH 1",
		"ALTER SEQUENCE interval_exercise_prescriptions_id_seq RESTART WITH 1",
	}

	for _, query := range resetSequences {
		if _, err := tx.Exec(ctx, query); err != nil {
			// Sequence might not exist, that's ok
			continue
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit delete transaction: %w", err)
	}

	// Then seed fresh test data
	if err := td.SeedTestData(ctx); err != nil {
		return fmt.Errorf("failed to seed test data after reset: %w", err)
	}

	return nil
}
