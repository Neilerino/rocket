# Claude Development Notes

## Testing

### Running Individual Integration Tests

To run a specific test within the integration test suite, use this syntax:

```bash
go test ./tests/integration -run "TestIntegrationSuite/TestIntervalExercisePrescriptionsList"
```

Pattern: `go test ./tests/integration -run "TestIntegrationSuite/<SpecificTestMethodName>"`

This allows you to run individual suite tests without running the entire test suite, which is useful for development and debugging specific functionality.
