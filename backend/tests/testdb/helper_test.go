package testdb

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSetupTestDB(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping testcontainer test in short mode")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	// Setup test database
	testDB, err := SetupTestDB(ctx)
	require.NoError(t, err, "Failed to setup test database")
	require.NotNil(t, testDB, "Test database should not be nil")
	defer func() {
		err := testDB.CleanupTestDB(ctx)
		assert.NoError(t, err, "Failed to cleanup test database")
	}()

	// Verify database connection
	assert.NotNil(t, testDB.DB, "Database connection should not be nil")
	assert.NotNil(t, testDB.Container, "Container should not be nil")
	assert.NotEmpty(t, testDB.ConnStr, "Connection string should not be empty")

	// Test health check
	err = testDB.Health(ctx)
	assert.NoError(t, err, "Health check should pass")

	t.Logf("Test database setup successful with connection: %s", testDB.ConnStr)
}

func TestTestDatabaseReset(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping testcontainer test in short mode")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	// Setup test database
	testDB, err := SetupTestDB(ctx)
	require.NoError(t, err, "Failed to setup test database")
	defer func() {
		err := testDB.CleanupTestDB(ctx)
		assert.NoError(t, err, "Failed to cleanup test database")
	}()

	// Test reset functionality
	err = testDB.Reset(ctx)
	assert.NoError(t, err, "Reset should not fail")

	// Verify health check still passes after reset
	err = testDB.Health(ctx)
	assert.NoError(t, err, "Health check should pass after reset")

	t.Log("Database reset functionality working correctly")
}

func TestTestDatabaseLifecycle(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping testcontainer test in short mode")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	// Test multiple setup/cleanup cycles
	for i := 0; i < 2; i++ {
		t.Run(fmt.Sprintf("cycle_%d", i), func(t *testing.T) {
			testDB, err := SetupTestDB(ctx)
			require.NoError(t, err, "Failed to setup test database in cycle %d", i)

			// Verify it works
			err = testDB.Health(ctx)
			assert.NoError(t, err, "Health check should pass in cycle %d", i)

			// Cleanup
			err = testDB.CleanupTestDB(ctx)
			assert.NoError(t, err, "Failed to cleanup test database in cycle %d", i)
		})
	}
}