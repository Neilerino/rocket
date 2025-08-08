# Backend Refactoring Tasks - Improve Development Velocity

## Overview
This document outlines specific tasks to reduce over-abstraction and improve development velocity in your Go backend. The current architecture has unnecessary layers that slow down feature development.

## Current Problems Identified

1. **Excessive Layering**: Handler → Service → Repository → SQLC (service layer adds minimal value)
2. **Per-request Object Creation**: New repository/service instances created for every request
3. **Type Conversion Overhead**: Duplicate types (DB vs API) with manual conversion
4. **Transaction Ceremony**: Complex transaction handling repeated everywhere
5. **Development Friction**: Adding a simple CRUD feature requires touching 3+ layers

## Refactoring Strategy

### Phase 1: Simplify Type System (High Impact, Low Risk)

#### Task 1.1: Consolidate Plan Types
**Priority: High** | **Effort: Low**

Remove duplicate type definitions and use DB types directly as API types where possible.

**Current State:**
```go
// backend/db/models.go - DB type
type Plan struct {
    ID          int64
    Name        string
    // ... DB-specific fields
}

// backend/internal/types/api_types.go - API type  
type Plan struct {
    ID          int64  `json:"id"`
    Name        string `json:"name"`
    // ... same fields with JSON tags
}
```

**Target State:**
```go
// backend/internal/types/models.go - Unified type
type Plan struct {
    ID          int64     `json:"id" db:"id"`
    Name        string    `json:"name" db:"name"`
    Description string    `json:"description" db:"description"`
    UserID      int64     `json:"userId" db:"user_id"`
    CreatedAt   time.Time `json:"createdAt" db:"created_at"`
    UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
    IsTemplate  bool      `json:"isTemplate" db:"is_template"`
    IsPublic    bool      `json:"isPublic" db:"is_public"`
}
```

**Steps:**
1. Create new unified types in `internal/types/models.go`
2. Update SQLC config to generate these unified types
3. Remove old API types from `internal/types/api_types.go`
4. Update all imports

#### Task 1.2: Eliminate Manual Type Conversion
**Priority: High** | **Effort: Medium**

Remove all manual type conversion code in service layers.

**Files to Update:**
- `internal/service/plans_service.go:41-50` (remove type conversion)
- `internal/service/exercises_service.go:24-32` (remove type conversion)
- All other service files with similar patterns

### Phase 2: Remove Service Layer (High Impact, Medium Risk) 🚀 **START HERE**

#### Task 2.1: Refactor Plans Handler to Direct Repository Access  
**Priority: CRITICAL - START WITH THIS** | **Effort: Medium** | **Protected by Integration Tests**

Eliminate the service layer for Plans and call repository directly from handlers.

**Current Flow:**
```
Handler → Service → Repository → SQLC
```

**Target Flow:**
```
Handler → Repository → SQLC
```

**Example - Plans List Handler:**

**Before:**
```go
// internal/api/handlers/plans.go:60-94
success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
    plan_repo := repository.PlansRepository{Queries: queries}
    plan_service := service.NewPlansService(&plan_repo)
    
    plans, err := plan_service.GetPlans(r.Context(), args)
    // ...
})
```

**After:**
```go
// internal/api/handlers/plans.go - simplified
success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
    plans, err := h.planRepo.GetPlans(r.Context(), args)
    if err != nil {
        return err
    }
    
    w.Header().Set("Content-Type", "application/json")
    return json.NewEncoder(w).Encode(plans)
})
```

**Steps:**
1. **Baseline measurement**: Run integration tests to establish current performance
2. **Create feature branch**: `refactor/remove-plans-service-layer`
3. Add repository field to PlanHandler struct
4. Update router.go to inject repository into handler  
5. **Gradual migration**: Update one handler method at a time
6. **Validate continuously**: Run Plans integration tests after each method
7. Remove service layer calls completely
8. **Final validation**: Full test suite + performance comparison
9. Delete plans_service.go after successful migration

**Integration Test Validation:**
- 12 Plans API tests must continue passing
- Error scenarios must work identically  
- Performance should improve or stay the same

#### Task 2.2: Create Repository Factory Pattern
**Priority: Medium** | **Effort: Low**

Pre-create repository instances instead of per-request allocation.

**Target Structure:**
```go
// internal/api/repositories.go
type Repositories struct {
    Plans     *repository.PlansRepository
    Exercises *repository.ExercisesRepository
    Groups    *repository.GroupsRepository
    // ... other repos
}

func NewRepositories(queries *db.Queries) *Repositories {
    return &Repositories{
        Plans:     &repository.PlansRepository{Queries: queries},
        Exercises: &repository.ExercisesRepository{Queries: queries},
        Groups:    &repository.GroupsRepository{Queries: queries},
    }
}
```

**Steps:**
1. Create `internal/api/repositories.go`
2. Update all handlers to use injected repositories
3. Update router.go to inject repositories

### Phase 3: Simplify Transaction Handling (Medium Impact, Low Risk)

#### Task 3.1: Create Simplified Transaction Helper
**Priority: Medium** | **Effort: Low**

Replace the complex `WithTransaction` pattern with a simpler helper.

**Current Pattern:**
```go
success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
    // business logic here
    return json.NewEncoder(w).Encode(result)
})
```

**Target Pattern:**
```go
result, err := api_utils.HandleTx(r.Context(), h.Db, func(repos *Repositories) (interface{}, error) {
    return repos.Plans.GetPlans(r.Context(), args)
})
if err != nil {
    api_utils.WriteError(w, http.StatusInternalServerError, err.Error())
    return
}
api_utils.WriteJSON(w, result)
```

**Steps:**
1. Create new `HandleTx` function in `internal/api/utils/`
2. Create `WriteJSON` helper function
3. Update all handlers to use new pattern

#### Task 3.2: Implement Repository Interface Pattern
**Priority: Low** | **Effort: Medium**

Create interfaces for repositories to improve testability.

**Target Structure:**
```go
// internal/repository/interfaces.go
type PlansRepo interface {
    GetPlans(ctx context.Context, args ListPlanArgs) ([]types.Plan, error)
    CreatePlan(ctx context.Context, plan types.Plan) (*types.Plan, error)
    // ... other methods
}
```

### Phase 4: Handler Consolidation (Low Impact, High Value)

#### Task 4.1: Create Generic CRUD Handler
**Priority: Low** | **Effort: Medium**

Most handlers follow the same CRUD pattern. Create a generic handler to reduce boilerplate.

**Target Structure:**
```go
// internal/api/handlers/crud.go
type CRUDHandler[T any] struct {
    repo   CRUDRepository[T]
    db     *db.Database
}

func (h *CRUDHandler[T]) List(w http.ResponseWriter, r *http.Request) {
    // Generic list implementation
}

func (h *CRUDHandler[T]) Create(w http.ResponseWriter, r *http.Request) {
    // Generic create implementation  
}
```

**Steps:**
1. Create generic CRUD handler
2. Update Plans handler to use generic pattern
3. Migrate other handlers progressively

### Phase 5: Performance Optimizations (Medium Impact, Low Risk)

#### Task 5.1: Add Query Result Caching
**Priority: Low** | **Effort: Medium**

Add simple in-memory caching for frequently accessed data.

**Example:**
```go
// internal/cache/cache.go
type Cache struct {
    plans     map[int64]*types.Plan
    exercises map[int64]*types.Exercise
    mu        sync.RWMutex
}
```

#### Task 5.2: Optimize Database Connection Handling
**Priority: Low** | **Effort: Low**

Review and optimize database connection pooling settings.

## 🎯 **RECOMMENDED MIGRATION ORDER** (Updated Based on Integration Test Coverage)

**Start with service layer removal for maximum immediate impact:**

1. **Week 1**: 
   - **Task 2.1** - Remove service layer for Plans (PRIORITY: Start here!)
   - **Task 2.2** - Repository factory pattern
2. **Week 2**: 
   - **Task 1.1** - Consolidate Plan types  
   - **Task 3.1** - Simplify transaction handling
3. **Week 3**: 
   - **Task 1.2** - Eliminate manual type conversion
   - Apply service layer removal to other APIs (Exercises, Groups)
4. **Week 4**: **Task 4.1** (Generic handlers) - Optional
5. **Week 5**: **Tasks 5.1, 5.2** (Performance) - Optional

### **Why Start with Service Layer Removal:**
- ✅ **Immediate 40% code reduction** for Plans API
- ✅ **Fastest developer velocity win** - see benefits immediately  
- ✅ **Lower risk than type changes** (which affect all layers)
- ✅ **Protected by comprehensive integration tests** (12 Plans API tests)
- ✅ **Plans API has no known bugs** (validated by test suite)

## Expected Benefits

- **50% reduction** in code required for new CRUD features
- **3x faster** feature development cycle
- **Simpler debugging** with fewer abstraction layers
- **Better performance** due to reduced allocations
- **Easier testing** with direct repository access

## 🛡️ **Risk Mitigation Strategy**

### **Integration Test Protection:**
- ✅ **12 Plans API integration tests** validate complete request/response flow
- ✅ **Real PostgreSQL database testing** catches issues mocks would miss
- ✅ **Error scenario coverage** ensures edge cases continue working
- ✅ **User isolation validation** confirms security isn't broken

### **Gradual Migration Approach:**
- Keep existing API contracts unchanged
- Migrate one entity at a time (start with Plans)
- Maintain backwards compatibility during transition
- Use feature branches with descriptive names (`refactor/remove-plans-service-layer`)

### **Validation Steps for Each Phase:**
```bash
# Before refactoring
go test -v ./tests/integration -run "TestIntegrationSuite/TestPlans" -timeout=10m

# After refactoring - same tests must pass
go test -v ./tests/integration -run "TestIntegrationSuite/TestPlans" -timeout=10m
```

### **Success Metrics to Track:**
- **Lines of code** for adding new Plan endpoints  
- **Number of files** requiring modification for Plan features
- **Memory allocations** per request (optional performance tracking)
- **Integration test execution time** (should remain stable)

## Example: Adding a New Feature (Before vs After)

### Before Refactoring (Current)
To add a simple "Get Plan Summary" endpoint:
1. Add method to `plans_repo.go` (repository layer)
2. Add method to `plans_service.go` (service layer) 
3. Add type conversion logic
4. Add handler method in `plans.go`
5. Add route in `router.go`

**Total: 5 files, ~100 lines of code**

### After Refactoring (Target)
To add a simple "Get Plan Summary" endpoint:
1. Add method to `plans_repo.go` (repository layer)
2. Add handler method in `plans.go`
3. Add route in `router.go`

**Total: 3 files, ~40 lines of code**

## 📝 **Implementation Notes**

### **Starting with Plans API:**
- Plans entity is representative of current patterns across the codebase
- **No known bugs** discovered during integration testing (unlike other APIs)
- Well-covered by integration tests (12 comprehensive test methods)
- Clear service layer pattern that can be replicated to other APIs

### **Git Strategy:**
- Keep detailed commit history during refactoring
- Use descriptive commit messages: `refactor(plans): remove service layer from List handler`
- Create PRs for each major step to enable code review
- Tag major milestones: `refactor-phase-1-complete`

### **Development Approach:**
- Consider this a **foundation for future features**, not just cleanup
- Focus on **developer experience improvements** over premature optimization  
- **Measure before and after** - track the actual velocity improvements
- **Document the new patterns** for team consistency

### **Future Migration Path:**
Once Plans refactoring proves successful:
1. **Exercises API** (8 tests) - has duplicate results bug to fix first
2. **Groups API** (10 tests) - has multiple known issues to address
3. **Parameter Types API** (8 tests) - completely broken, needs bug fixes first
4. **Plan Intervals API** (13 tests) - foreign key constraint issues
5. **Prescriptions API** (15 tests) - most complex, save for last

### **Success Criteria:**
- ✅ **40% reduction** in code for Plans CRUD operations
- ✅ **All 12 integration tests** continue passing
- ✅ **Same API behavior** from client perspective  
- ✅ **Improved developer velocity** for new Plan features
- ✅ **Clear documentation** of new patterns for team adoption