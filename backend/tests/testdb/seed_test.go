package testdb

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSeedTestData(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping testcontainer test in short mode")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Minute)
	defer cancel()

	// Setup test database
	testDB, err := SetupTestDB(ctx)
	require.NoError(t, err, "Failed to setup test database")
	defer func() {
		err := testDB.CleanupTestDB(ctx)
		assert.NoError(t, err, "Failed to cleanup test database")
	}()

	// Load seed data
	err = testDB.SeedTestData(ctx)
	require.NoError(t, err, "Failed to seed test data")

	// Verify seed data was loaded correctly
	tx, err := testDB.DB.Begin(ctx)
	require.NoError(t, err, "Failed to start verification transaction")

	// Test 1: Verify users were created
	var userCount int
	err = tx.QueryRow(ctx, "SELECT COUNT(*) FROM users").Scan(&userCount)
	require.NoError(t, err, "Failed to count users")
	assert.Equal(t, 2, userCount, "Expected 2 users")

	// Test 2: Verify plans with correct filter combinations
	var planCount int
	err = tx.QueryRow(ctx, "SELECT COUNT(*) FROM plans WHERE user_id = 1").Scan(&planCount)
	require.NoError(t, err, "Failed to count user 1 plans")
	assert.Equal(t, 4, planCount, "Expected 4 plans for user 1")

	// Test 3: Verify template plans
	var templateCount int
	err = tx.QueryRow(ctx, "SELECT COUNT(*) FROM plans WHERE user_id = 1 AND is_template = true").Scan(&templateCount)
	require.NoError(t, err, "Failed to count template plans")
	assert.Equal(t, 2, templateCount, "Expected 2 template plans for user 1")

	// Test 4: Verify public plans
	var publicCount int
	err = tx.QueryRow(ctx, "SELECT COUNT(*) FROM plans WHERE user_id = 1 AND is_public = true").Scan(&publicCount)
	require.NoError(t, err, "Failed to count public plans")
	assert.Equal(t, 2, publicCount, "Expected 2 public plans for user 1")

	// Test 5: Verify exercises
	var exerciseCount int
	err = tx.QueryRow(ctx, "SELECT COUNT(*) FROM exercises WHERE user_id = 1").Scan(&exerciseCount)
	require.NoError(t, err, "Failed to count user 1 exercises")
	assert.Equal(t, 3, exerciseCount, "Expected 3 exercises for user 1")

	// Test 6: Verify exercise variations
	var variationCount int
	err = tx.QueryRow(ctx, "SELECT COUNT(*) FROM exercise_variations").Scan(&variationCount)
	require.NoError(t, err, "Failed to count exercise variations")
	assert.Equal(t, 6, variationCount, "Expected 6 exercise variations")

	// Test 7: Verify complex relationship (prescriptions with variations)
	var prescriptionCount int
	query := `
		SELECT COUNT(*)
		FROM interval_exercise_prescriptions iep
		JOIN exercise_variations ev ON iep.exercise_variation_id = ev.id
		JOIN exercises e ON ev.exercise_id = e.id
		WHERE e.user_id = 1
	`
	err = tx.QueryRow(ctx, query).Scan(&prescriptionCount)
	require.NoError(t, err, "Failed to count prescriptions with relationships")
	assert.Equal(t, 7, prescriptionCount, "Expected 7 prescriptions for user 1 exercises")

	// Test 8: Verify parameter types (global data)
	var paramTypeCount int
	err = tx.QueryRow(ctx, "SELECT COUNT(*) FROM parameter_types").Scan(&paramTypeCount)
	require.NoError(t, err, "Failed to count parameter types")
	assert.Equal(t, 5, paramTypeCount, "Expected 5 parameter types")

	err = tx.Commit(ctx)
	require.NoError(t, err, "Failed to commit verification transaction")

	t.Log("All seed data verification tests passed successfully")
}

func TestSeedDataReset(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping testcontainer test in short mode")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Minute)
	defer cancel()

	// Setup test database
	testDB, err := SetupTestDB(ctx)
	require.NoError(t, err, "Failed to setup test database")
	defer func() {
		err := testDB.CleanupTestDB(ctx)
		assert.NoError(t, err, "Failed to cleanup test database")
	}()

	// Load seed data
	err = testDB.SeedTestData(ctx)
	require.NoError(t, err, "Failed to seed test data")

	// Reset database
	err = testDB.Reset(ctx)
	require.NoError(t, err, "Failed to reset database")

	// Verify data was cleared
	tx, err := testDB.DB.Begin(ctx)
	require.NoError(t, err, "Failed to start verification transaction")

	var userCount int
	err = tx.QueryRow(ctx, "SELECT COUNT(*) FROM users").Scan(&userCount)
	require.NoError(t, err, "Failed to count users after reset")
	assert.Equal(t, 0, userCount, "Expected 0 users after reset")

	var planCount int
	err = tx.QueryRow(ctx, "SELECT COUNT(*) FROM plans").Scan(&planCount)
	require.NoError(t, err, "Failed to count plans after reset")
	assert.Equal(t, 0, planCount, "Expected 0 plans after reset")

	err = tx.Commit(ctx)
	require.NoError(t, err, "Failed to commit verification transaction")

	// Re-seed data to verify it works after reset
	err = testDB.SeedTestData(ctx)
	require.NoError(t, err, "Failed to re-seed test data")

	tx2, err := testDB.DB.Begin(ctx)
	require.NoError(t, err, "Failed to start re-verification transaction")

	err = tx2.QueryRow(ctx, "SELECT COUNT(*) FROM users").Scan(&userCount)
	require.NoError(t, err, "Failed to count users after re-seed")
	assert.Equal(t, 2, userCount, "Expected 2 users after re-seed")

	err = tx2.Commit(ctx)
	require.NoError(t, err, "Failed to commit re-verification transaction")

	t.Log("Seed data reset and reload functionality working correctly")
}
