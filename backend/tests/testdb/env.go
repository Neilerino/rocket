package testdb

import (
	"os"
)

// SetTestEnvironment configures the environment for testing with testcontainers
func SetTestEnvironment() {
	// Disable Ryuk reaper to avoid Docker network issues in some environments
	os.Setenv("TESTCONTAINERS_RYUK_DISABLED", "true")
}

// init automatically sets up the test environment when the package is imported
func init() {
	SetTestEnvironment()
}