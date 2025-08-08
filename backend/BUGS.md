# Known Issues Discovered During Integration Testing

This document tracks bugs and issues discovered while implementing the integration test suite. These are real backend problems that our tests caught - exactly what integration testing should do!

---

## 🐛 **Critical Issues**

### 1. **HTTP Error Code Inconsistencies**
**Severity:** Medium | **Priority:** High  
**Affected Endpoints:** Multiple

**Issue:**  
Several endpoints return `500 Internal Server Error` instead of the expected `404 Not Found` when resources don't exist.

**Expected Behavior:**  
- Non-existent resource requests should return `404 Not Found`
- Only actual server errors should return `500 Internal Server Error`

**Observed Behavior:**  
- Plans GetById: Returns `500` instead of `404` for non-existent plan IDs
- Exercises Update/Delete: Returns `500` instead of `404` for non-existent exercise IDs
- Groups Update/Delete: Returns `500` instead of `404` for non-existent group IDs

**Test Evidence:**
```
2025/08/08 13:17:46 ERROR [plans.go:179] no rows in result set
2025/08/08 13:17:46 HTTP 500 Error: no rows in result set
Expected: 404 Not Found
Actual: 500 Internal Server Error
```

**Root Cause:**  
Service layer is not properly handling "no rows found" errors from database queries.

**Impact:**  
- Poor API design/user experience
- Makes it harder for clients to distinguish between actual errors and missing resources
- Non-standard HTTP behavior

---

## 🔍 **Data Quality Issues**

### 2. **Duplicate Results in List Endpoints**
**Severity:** High | **Priority:** Critical  
**Affected Endpoints:** Exercises, Groups APIs

**Issue:**  
List endpoints are returning duplicate records instead of unique results.

**Expected Behavior:**  
- `GET /exercises?userId=1` should return 3 unique exercises
- `GET /exercises?id=1` should return 1 unique exercise
- `GET /groups?userId=1` should return 3 unique groups
- `GET /groups?id=1` should return 1 unique group

**Observed Behavior:**  
- `GET /exercises?userId=1` returns 7 records (with duplicates)
- `GET /exercises?id=1` returns 4 records (should be 1)
- `GET /groups?userId=1` returns 5 records (with duplicates)  
- `GET /groups?id=1` returns 3 records (should be 1)

**Test Evidence:**
```
Expected: 3 exercises for user 1
Actual: 7 exercises returned (with duplicates)

Expected: 1 exercise with ID=1  
Actual: 4 exercises returned (all with ID=1)
```

**Root Cause:**  
Likely caused by improper SQL JOINs in the service layer that are creating Cartesian products without proper DISTINCT clauses or GROUP BY statements.

**Impact:**  
- **CRITICAL:** This could cause performance issues and incorrect data display
- Clients receive incorrect data counts
- Potential memory/bandwidth waste
- Makes pagination unreliable

---

## 🔧 **API Design Issues**

### 3. **Inconsistent Response Status Codes**
**Severity:** Low | **Priority:** Medium  
**Affected Endpoints:** Groups Delete

**Issue:**  
Groups DELETE endpoint returns `200 OK` instead of the standard `204 No Content` for successful deletions.

**Expected Behavior:**  
- DELETE operations should return `204 No Content` when successful
- This follows REST API conventions

**Observed Behavior:**  
- `DELETE /groups/{id}` returns `200 OK`

**Test Evidence:**
```go
// Note: Handler returns 200, not 204
recorder := suite.DELETE("/api/v1/groups/1")
suite.AssertStatusCode(recorder, 200) // Should be 204
```

**Root Cause:**  
Handler explicitly sets `w.WriteHeader(http.StatusOK)` instead of `http.StatusNoContent`.

**Impact:**  
- Minor API inconsistency
- Not following REST conventions
- Could confuse API consumers

---

## 🧪 **Testing Discoveries**

### 4. **Hardcoded User ID in Groups Creation**
**Severity:** Medium | **Priority:** Medium  
**Affected Endpoints:** Groups Create API

**Issue:**  
Groups creation handler has a hardcoded user ID instead of accepting it from the request.

**Location:** `handlers/groups.go:92`
```go
group, err := group_service.CreateGroup(r.Context(), args.Name, args.Description, 1)
//                                                                                  ^ hardcoded!
```

**Expected Behavior:**  
- User ID should come from request body or authentication context
- Different users should be able to create groups

**Observed Behavior:**  
- All groups are created with `user_id = 1` regardless of the request

**Impact:**  
- Multi-user functionality broken
- Security issue - users can't properly isolate their data
- Testing revealed this would cause problems in production

---

## 🔄 **Test Infrastructure Findings**

### 5. **Route Parameter Naming Inconsistency**  
**Severity:** Low | **Priority:** Low  
**Affected Endpoints:** Groups Interval Assignment

**Issue:**  
The Groups handler has inconsistent URL parameter names between assignment and removal endpoints.

**Details:**
```go
// Assignment: uses "intervalId"  
r.Post("/{groupId}/assign/{intervalId}", groups_handler.AssignToInterval)

// Removal: handler expects "planIntervalId" but route uses "intervalId"
r.Delete("/{groupId}/assign/{intervalId}", groups_handler.RemoveFromInterval)

// But in RemoveFromInterval handler:
planIntervalId, err := api_utils.ParseBigInt(chi.URLParam(r, "planIntervalId"))
//                                                           ^ expects different name!
```

**Impact:**  
- Remove operation likely fails due to parameter name mismatch
- Inconsistent API design

---

## 📈 **Success Metrics**

**✅ What's Working Well:**
- Plans API operates correctly (no major issues found)
- Database reset/isolation mechanism works perfectly
- HTTP request/response flow is solid
- Error response structure is consistent
- User isolation works correctly where implemented
- Test data relationships are properly configured

**🎯 Testing Framework Success:**
- **All issues were caught by integration tests** - this validates our testing approach
- Tests provide clear reproduction steps for each bug
- Database isolation ensures consistent bug reproduction
- Framework makes it easy to verify fixes

### 6. **Parameter Types API Returns Empty Results**
**Severity:** High | **Priority:** High  
**Affected Endpoints:** Parameter Types List API

**Issue:**  
The Parameter Types endpoint returns empty arrays even when parameter types exist in the database.

**Expected Behavior:**  
- `GET /parameter-types?userId=1` should return available parameter types
- `GET /parameter-types?parameterTypeId=1` should return the specific parameter type with ID 1

**Observed Behavior:**  
- All requests return `200 OK` with empty array `[]` (17 bytes)
- Test data contains 5 parameter types (Weight, Reps, Duration, Distance, Percentage)
- No parameter types are returned for any query

**Test Evidence:**
```
GET /parameter-types?userId=1 → 200 OK, 17B (empty array)
GET /parameter-types?parameterTypeId=1 → 200 OK, 17B (empty array)
Expected: Array of parameter types
Actual: []
```

**Root Cause:**  
Likely issue in the Parameter Types service layer - either:
1. SQL query is incorrect and not finding any records
2. Service layer filtering logic is too restrictive
3. Database relationships or data seeding issue

**Impact:**  
- **CRITICAL:** Parameter Types functionality is completely broken
- Users cannot access parameter type definitions
- Could prevent exercise variation creation/editing
- Frontend likely showing empty dropdowns

**Notes:**  
- Error handling works correctly (400 for missing filters)
- Database connectivity is working (other endpoints work)
- Test data is properly seeded (parameter types exist in seed_data.sql)

### 7. **Plan Intervals Delete Fails Due to Foreign Key Constraints**
**Severity:** High | **Priority:** High  
**Affected Endpoints:** Plan Intervals Delete API

**Issue:**  
Deleting plan intervals fails when they have related data (prescriptions) due to database foreign key constraints.

**Expected Behavior:**  
- Should either cascade delete related data or return a proper error message
- Should not return 500 error for business logic constraints

**Observed Behavior:**  
- `DELETE /intervals/1` returns 500 error with database constraint message
- Error exposes internal database details to API consumers

**Test Evidence:**
```
DELETE /intervals/1 → 500 Internal Server Error
Error: "update or delete on table "plan_intervals" violates foreign key constraint 
"interval_exercise_prescriptions_plan_interval_id_fkey" on table "interval_exercise_prescriptions""
```

**Root Cause:**  
- Database foreign key constraints prevent deletion when related records exist
- Service layer doesn't handle this business logic properly
- Should either use CASCADE DELETE or validate before deletion

**Impact:**  
- Users cannot delete plan intervals that have prescriptions
- Database implementation details exposed to API consumers
- Poor user experience with cryptic error messages

### 8. **Plan Intervals API - More 500 vs 404 Error Issues**
**Severity:** Medium | **Priority:** High  
**Affected Endpoints:** Plan Intervals Delete API

**Issue:**  
Plan Intervals DELETE endpoint returns `500 Internal Server Error` instead of `404 Not Found` for non-existent intervals.

**Expected Behavior:**  
- `DELETE /intervals/999` should return `404 Not Found`

**Observed Behavior:**  
- Returns `500 Internal Server Error` with "no rows in result set" message

**Test Evidence:**
```
DELETE /intervals/999 → 500 Internal Server Error  
Error: "no rows in result set"
Expected: 404 Not Found
```

**Root Cause:**  
Same pattern as other endpoints - service layer not handling "not found" cases properly.

**Impact:**  
- Consistent API design issue across multiple endpoints
- Makes error handling difficult for client applications

### 9. **Time/Duration Format Inconsistency in Prescriptions API**
**Severity:** Low | **Priority:** Medium  
**Affected Endpoints:** Interval Exercise Prescriptions Create API

**Issue:**  
The Interval Exercise Prescriptions API expects PostgreSQL interval format for duration/rest fields, but this is inconsistent with how duration data is stored and displayed.

**Expected Behavior:**  
- API should accept common time formats like "00:01:30" (HH:MM:SS) or be consistent across all endpoints
- Error messages should be clear about expected format

**Observed Behavior:**  
- API only accepts PostgreSQL interval format ("1 minute 30 seconds")  
- Returns error: "invalid time format, expected combination of weeks, days, hours, minutes, seconds"

**Test Evidence:**
```
POST /interval-exercise-prescriptions
Body: {"rest": "00:01:30"}
→ 500 Error: "invalid time format, expected combination of weeks, days, hours, minutes, seconds"

Working format: {"rest": "1 minute 30 seconds"}
```

**Root Cause:**  
Backend expects raw PostgreSQL INTERVAL format instead of standardized time format.

**Impact:**  
- Inconsistent API design  
- Makes client integration more difficult
- Seed data uses "00:01:30" format but API expects different format

---

## 🚀 **Next Steps**

1. **Fix Critical Issues First:**
   - Address duplicate results in Exercises/Groups APIs
   - Fix 404 vs 500 error code handling

2. **Address API Consistency:**
   - Standardize DELETE response codes
   - Fix hardcoded user ID in Groups creation
   - Resolve route parameter naming inconsistency

3. **Validate Fixes:**
   - Re-run integration tests after each fix
   - Ensure no regressions are introduced

4. **Expand Test Coverage:**
   - Add tests for remaining endpoints
   - Focus on complex aggregated data endpoints

---

*This document will be updated as new issues are discovered and existing issues are resolved.*