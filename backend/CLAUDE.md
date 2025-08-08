# Claude Development Notes

## Testing

### Running Individual Integration Tests

To run a specific test within the integration test suite, use this syntax:

```bash
go test ./tests/integration -run "TestIntegrationSuite/TestIntervalExercisePrescriptionsList"
```

Pattern: `go test ./tests/integration -run "TestIntegrationSuite/<SpecificTestMethodName>"`

This allows you to run individual suite tests without running the entire test suite, which is useful for development and debugging specific functionality.

### Database Reset Strategy for Tests

**Problem**: The original setup used `TRUNCATE CASCADE` before every test (90+ resets), causing timeouts due to lock contention and connection pool exhaustion.

**Solution**: Fast `DELETE + sequence reset` approach that runs before every test.

**Implementation**:
```go
func (suite *IntegrationTestSuite) SetupTest() {
    // Use QuickReset instead of the slow TRUNCATE CASCADE approach
    // DELETE is much faster than TRUNCATE and avoids lock contention
    err := suite.testDB.QuickReset(suite.ctx)
    suite.Require().NoError(err, "Failed to quick reset test data")
}
```

**`QuickReset()` vs `TRUNCATE CASCADE`:**
- **Uses `DELETE`** instead of `TRUNCATE` → No table locks
- **Resets sequences** to maintain predictable IDs
- **Single transaction** for all operations
- **~10x faster** than TRUNCATE CASCADE
- **Perfect isolation** - every test starts with fresh data

**Benefits:**
- **Eliminates timeout issues** caused by lock contention
- **Perfect test isolation** - no shared state between tests
- **Consistent IDs** - sequences reset so tests are predictable
- **Simple approach** - no complex transaction management needed
- **Zero manual changes** to individual tests

**Additional Improvements:**
- **`TearDownTest()`** ensures cleanup after each test
- **Container termination timeout** prevents hanging on suite teardown
- **Connection pool drainage** allows proper cleanup