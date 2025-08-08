# Test Database Helper

This package provides utilities for setting up PostgreSQL testcontainers for integration testing.

## Features

- **Automatic Container Management**: Spins up PostgreSQL 15 in Docker container
- **Schema Application**: Automatically applies your database schema
- **Connection Management**: Provides configured database connections
- **Cleanup**: Proper container termination and resource cleanup
- **Environment Setup**: Automatically configures testcontainers environment

## Quick Start

```go
import (
    "context"
    "testing"
    
    "backend/tests/testdb"
    "github.com/stretchr/testify/require"
)

func TestMyAPI(t *testing.T) {
    ctx := context.Background()
    
    // Setup test database
    testDB, err := testdb.SetupTestDB(ctx)
    require.NoError(t, err)
    defer testDB.CleanupTestDB(ctx)
    
    // Use testDB.DB for your tests
    // Your test code here...
}
```

## API Reference

### SetupTestDB(ctx context.Context) (*TestDatabase, error)
Creates a new PostgreSQL testcontainer with your schema applied.

**Returns:**
- `*TestDatabase`: Configured test database instance
- `error`: Any setup errors

### TestDatabase.CleanupTestDB(ctx context.Context) error
Properly closes database connections and terminates the container.

**Returns:**
- `error`: Any cleanup errors

### TestDatabase.Reset(ctx context.Context) error
Truncates all tables while preserving schema. Useful for test isolation.

**Returns:**
- `error`: Any reset errors

### TestDatabase.Health(ctx context.Context) error
Performs a basic health check on the database connection.

**Returns:**
- `error`: Any health check failures

## Configuration

The helper uses these default configurations:

- **Database**: `rocket_test`
- **User**: `test_user` 
- **Password**: `test_password`
- **Image**: `postgres:15-alpine`
- **Timeout**: 60 seconds for container startup

## Environment Variables

The package automatically sets:
- `TESTCONTAINERS_RYUK_DISABLED=true` - Disables the reaper to avoid Docker network issues

## Performance Tips

1. **Reuse Containers**: For test suites, consider setting up once per suite rather than per test
2. **Parallel Tests**: Each test should get its own container to avoid conflicts
3. **Skip Short Tests**: Use `testing.Short()` to skip container tests in short mode

## Example Test Suite

```go
type APITestSuite struct {
    suite.Suite
    testDB *testdb.TestDatabase
}

func (suite *APITestSuite) SetupSuite() {
    ctx := context.Background()
    testDB, err := testdb.SetupTestDB(ctx)
    suite.Require().NoError(err)
    suite.testDB = testDB
}

func (suite *APITestSuite) TearDownSuite() {
    ctx := context.Background()
    err := suite.testDB.CleanupTestDB(ctx)
    suite.Require().NoError(err)
}

func (suite *APITestSuite) SetupTest() {
    ctx := context.Background()
    err := suite.testDB.Reset(ctx)
    suite.Require().NoError(err)
}

func TestAPISuite(t *testing.T) {
    if testing.Short() {
        t.Skip("Skipping integration tests in short mode")
    }
    suite.Run(t, new(APITestSuite))
}
```

## Troubleshooting

### Container Won't Start
- Ensure Docker is running
- Check that PostgreSQL port isn't already in use
- Verify Docker has enough resources

### Network Issues
- The package automatically disables Ryuk reaper which can cause network issues
- Try running with `TESTCONTAINERS_RYUK_DISABLED=true` if you encounter network problems

### Schema Issues
- Verify your SQL schema files are valid
- Check that all foreign key relationships are properly defined
- Ensure table creation order respects dependencies