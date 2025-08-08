# GitHub Actions Workflows

This directory contains automated testing workflows for the Rocket backend API.

## 🚀 Workflows Overview

### 1. `test.yml` - Complete Backend Test Suite
**Triggers:** Push/PR to main/develop branches  
**Duration:** ~15-20 minutes

Comprehensive testing pipeline that includes:
- **Unit Tests**: Fast tests with mocks for business logic validation
- **Integration Tests**: Full API testing with real PostgreSQL database via testcontainers
- **Code Coverage**: Generates coverage reports and uploads to Codecov
- **Linting**: Code quality checks with golangci-lint  
- **Build Verification**: Ensures the application compiles successfully

### 2. `integration-tests.yml` - Focused Integration Testing
**Triggers:** Push/PR to main/develop branches  
**Duration:** ~15-25 minutes

Specialized workflow for our comprehensive integration test suite:
- **Full Integration Tests**: Runs all 60+ integration test methods
- **Quick Integration Test**: Fast subset for immediate feedback (Plans API only)
- **Docker Optimization**: Pre-pulls images and manages container lifecycle
- **Real Database Testing**: Uses PostgreSQL testcontainers for authentic testing

### 3. `api-tests.yml` - Matrix Strategy API Testing  
**Triggers:** Push/PR + Daily scheduled runs  
**Duration:** ~10-15 minutes (parallel execution)

Advanced workflow using GitHub's matrix strategy:
- **Parallel Execution**: Tests each API endpoint suite separately to avoid timeouts
- **Bug Detection**: Specialized tests for known issues documented in BUGS.md
- **Comprehensive Coverage**: All 6 major API endpoints tested independently
- **Detailed Reporting**: Clear success/failure summaries with actionable insights

## 🧪 Integration Test Coverage

Our integration tests provide complete confidence for refactoring by testing:

| API Endpoint | Tests | Coverage |
|--------------|-------|----------|
| **Plans API** | 12 tests | ✅ CRUD, filtering, pagination, user isolation |
| **Exercises API** | 8 tests | ✅ Data validation, duplicate detection |
| **Groups API** | 10 tests | ✅ Complex relationships, interval assignments |
| **Parameter Types API** | 8 tests | ✅ System configuration, empty result detection |
| **Plan Intervals API** | 13 tests | ✅ Nested structures, foreign key constraints |
| **Prescriptions API** | 15 tests | ✅ Most complex aggregated data across tables |

**Total: 66 integration test methods** providing real database validation.

## 🐛 Bug Detection

The workflows automatically detect the 9 backend issues documented in `BUGS.md`:

1. **Critical duplicate results** in Exercises/Groups list endpoints
2. **Broken Parameter Types API** returning empty arrays
3. **Foreign key constraint failures** preventing deletions
4. **HTTP error code inconsistencies** (500 vs 404 responses)  
5. **Time format inconsistencies** in Prescriptions API
6. **Hardcoded user IDs** breaking multi-user functionality
7. **Route parameter naming** inconsistencies
8. **API response code** standardization issues
9. **Database constraint** error handling

## 🏃‍♂️ Running Tests Locally

```bash
# Run unit tests only
cd backend
go test -v -race ./... -skip="TestIntegrationSuite"

# Run integration tests only  
go test -v ./tests/integration -timeout=15m

# Run specific API test suite
go test -v ./tests/integration -run "TestIntegrationSuite/TestPlans" -timeout=10m

# Run with coverage
go test -v -race -coverprofile=coverage.out ./... -skip="TestIntegrationSuite"
go tool cover -html=coverage.out -o coverage.html
```

## 🔧 Workflow Configuration

### Docker Requirements
- All workflows use **testcontainers** requiring Docker
- PostgreSQL 15-alpine images are pre-pulled for performance
- Container cleanup is automatic with proper labeling

### Environment Setup
- Go version automatically detected from `go.mod`
- Dependencies cached using `go.sum` checksum
- Parallel test execution disabled (`-test.parallel=1`) for database isolation

### Timeout Management
- **Unit tests**: 10 minutes
- **Integration tests**: 15-25 minutes  
- **Individual API suites**: 12 minutes
- **Quick tests**: 8 minutes

## 📊 Success Metrics

✅ **What gets validated:**
- Complete API request/response cycles
- Real database CRUD operations  
- Complex aggregated queries across multiple tables
- User isolation and data security
- Error handling and HTTP status codes
- Database transaction integrity
- Foreign key constraint validation

✅ **Confidence for refactoring:**
- All API endpoints have integration test coverage
- Database schema changes are validated
- Service layer refactoring is safe
- Handler modifications won't break clients
- Repository pattern changes are protected

## 🚨 When Tests Fail

1. **Check the specific workflow** that failed (test, integration-tests, or api-tests)
2. **Review the logs** for the exact test method that failed
3. **Reference BUGS.md** - failure might be a known issue
4. **Run tests locally** to reproduce and debug
5. **Fix the backend issue** before merging

The comprehensive test suite ensures your refactoring work in TASKS.md can be done with complete confidence! 🛡️