# Test Data Fixtures

This directory contains comprehensive test data for integration testing of the Rocket Backend APIs.

## Overview

The `seed_data.sql` file provides realistic test data covering all database relationships and API scenarios. This data is designed to enable thorough testing of GET endpoints before refactoring.

## Data Design

### Test Users
- **User 1** (`id: 1`): Primary test user with comprehensive data
- **User 2** (`id: 2`): Secondary user for isolation testing

### Plans Coverage
The test data includes 5 plans covering all filter combinations:

| Plan ID | User | Name | Template | Public | Purpose |
|---------|------|------|----------|--------|---------|
| 1 | 1 | User1 Regular Plan | ❌ | ❌ | Basic plan |
| 2 | 1 | User1 Template Plan | ✅ | ❌ | Template testing |
| 3 | 1 | User1 Public Plan | ❌ | ✅ | Public testing |
| 4 | 1 | User1 Public Template | ✅ | ✅ | Combined flags |
| 5 | 2 | User2 Plan | ❌ | ❌ | User isolation |

### Exercise Data
- **3 exercises** for User 1 (Push-ups, Squats, Plank)
- **1 exercise** for User 2 (isolation testing)
- **6 exercise variations** total
- **Multiple parameter types** (Weight, Reps, Duration, Distance, Percentage)

### Complex Relationships
- **4 plan intervals** across different plans
- **4 exercise groups** (Upper Body, Lower Body, Core + User 2)
- **6 interval-group assignments** with varying frequencies
- **8 exercise prescriptions** with complex aggregated data

## API Test Scenarios Covered

### Plans API (`GET /api/v1/plans`)
- ✅ `userId=1` → 4 plans
- ✅ `userId=1&isTemplate=true` → 2 plans
- ✅ `userId=1&isPublic=true` → 2 plans
- ✅ `userId=1&isTemplate=true&isPublic=true` → 1 plan
- ✅ `planId=1` → single plan
- ✅ `userId=2` → 1 plan (isolation)

### Exercises API (`GET /api/v1/exercises`)
- ✅ `userId=1` → 3 exercises
- ✅ `userId=2` → 1 exercise (isolation)

### Groups API (`GET /api/v1/groups`)
- ✅ `userId=1` → 3 groups
- ✅ `userId=2` → 1 group (isolation)

### Intervals API (`GET /api/v1/intervals`)
- ✅ `planId=1` → 2 intervals (ordered)
- ✅ `planId=2` → 1 interval
- ✅ Aggregated group counts

### Prescriptions API (`GET /api/v1/interval-exercise-prescriptions`)
- ✅ `groupId=1` → prescriptions with exercise variations
- ✅ `intervalId=1` → multiple prescriptions
- ✅ Complex JOIN data (exercise → variation → prescription)
- ✅ Various parameter types (reps, duration, rest periods)

### Parameter Types API (`GET /api/v1/parameter-types`)
- ✅ All parameter types (global data)
- ✅ Different data types and units

## Data Relationships

```
Users (2)
├── Plans (5)
│   └── Plan Intervals (4)
│       ├── Interval Group Assignments (6)
│       └── Exercise Prescriptions (8)
├── Exercises (4)
│   └── Exercise Variations (6)
│       ├── Variation Parameters (6)
│       └── Exercise Prescriptions (8)
└── Groups (4)
    ├── Interval Group Assignments (6)
    └── Exercise Prescriptions (8)

Parameter Types (5) → Variation Parameters (6)
```

## Key Features

### Predictable IDs
All entities use predictable, sequential IDs starting from 1 for easy testing and assertions.

### Foreign Key Integrity
All relationships are properly established with correct foreign key references.

### Realistic Data
- Proper exercise names and descriptions
- Realistic workout parameters (sets, reps, rest periods)
- Logical grouping and interval structures

### Edge Cases
- Both NULL and non-NULL values for optional fields
- Various duration formats (intervals)
- Different parameter combinations

## Usage in Tests

```go
// Setup test database with seed data
testDB, err := testdb.SetupTestDB(ctx)
require.NoError(t, err)

err = testDB.SeedTestData(ctx)
require.NoError(t, err)

// Test your API endpoints
// Data is now available for testing
```

## Verification Queries

Use these queries to verify data integrity:

```sql
-- Check plan filter combinations
SELECT id, name, user_id, is_template, is_public 
FROM plans ORDER BY id;

-- Check complex relationships
SELECT 
    iep.id,
    g.name as group_name,
    ev.name as variation_name,
    e.name as exercise_name,
    iep.sets, iep.reps, iep.duration
FROM interval_exercise_prescriptions iep
JOIN groups g ON iep.group_id = g.id
JOIN exercise_variations ev ON iep.exercise_variation_id = ev.id  
JOIN exercises e ON ev.exercise_id = e.id
ORDER BY iep.id;
```

## Reset and Reload

The test helper provides `Reset()` and `SeedTestData()` methods:

- **Reset()**: Truncates all tables while preserving schema
- **SeedTestData()**: Reloads the complete dataset

This enables test isolation where each test gets a fresh, consistent dataset.

## Maintenance

When adding new API endpoints or modifying database schema:

1. Update `seed_data.sql` with additional test data
2. Add corresponding verification queries
3. Update this documentation
4. Test with the new scenarios

The goal is to maintain comprehensive coverage of all API scenarios with realistic, interconnected test data.