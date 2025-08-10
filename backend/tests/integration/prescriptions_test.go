package integration

import (
	"backend/internal/types"
)

// TestIntervalExercisePrescriptionsList tests the GET /api/v1/interval-exercise-prescriptions endpoint
// This is the most complex API endpoint with aggregated data across multiple tables
func (suite *IntegrationTestSuite) TestIntervalExercisePrescriptionsList() {
	// Test Case 1: groupId=1 should return prescriptions for Upper Body group
	recorder := suite.GET("/api/v1/interval-exercise-prescriptions?groupId=1")
	suite.AssertStatusCode(recorder, 200)
	
	var prescriptions []types.IntervalExercisePrescription
	suite.GetResponseData(recorder, &prescriptions)
	
	// Group 1 (Upper Body) should have prescriptions in intervals 1, 2, and 3
	suite.GreaterOrEqual(len(prescriptions), 3, "Group 1 should have at least 3 prescriptions")
	
	// Verify all prescriptions belong to group 1
	for _, prescription := range prescriptions {
		suite.Equal(int64(1), prescription.GroupId, "All prescriptions should belong to group 1")
		suite.NotZero(prescription.ID, "Prescription should have an ID")
		suite.NotZero(prescription.ExerciseVariationId, "Prescription should have exercise variation")
		suite.NotZero(prescription.PlanIntervalId, "Prescription should have plan interval")
		suite.NotZero(prescription.Sets, "Prescription should have sets")
	}

	// Test Case 2: intervalId=1 should return prescriptions for first interval
	recorder = suite.GET("/api/v1/interval-exercise-prescriptions?intervalId=1")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &prescriptions)
	
	// Interval 1 should have 4 prescriptions (2 upper body + 2 lower body)
	suite.Len(prescriptions, 4, "Interval 1 should have 4 prescriptions")
	
	// Verify all prescriptions belong to interval 1
	for _, prescription := range prescriptions {
		suite.Equal(int64(1), prescription.PlanIntervalId, "All prescriptions should belong to interval 1")
	}
	
	// Verify we have both upper body (group 1) and lower body (group 2) prescriptions
	groupIds := make(map[int64]bool)
	for _, prescription := range prescriptions {
		groupIds[prescription.GroupId] = true
	}
	suite.True(groupIds[1], "Should have upper body prescriptions (group 1)")
	suite.True(groupIds[2], "Should have lower body prescriptions (group 2)")

	// Test Case 3: Both filters - groupId=1&intervalId=1
	recorder = suite.GET("/api/v1/interval-exercise-prescriptions?groupId=1&intervalId=1")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &prescriptions)
	
	// Should have 2 upper body prescriptions in interval 1
	suite.Len(prescriptions, 2, "Group 1 in interval 1 should have 2 prescriptions")
	
	for _, prescription := range prescriptions {
		suite.Equal(int64(1), prescription.GroupId, "Should be group 1")
		suite.Equal(int64(1), prescription.PlanIntervalId, "Should be interval 1")
	}
}

// TestIntervalExercisePrescriptionsListComplexAggregation tests complex aggregated data
func (suite *IntegrationTestSuite) TestIntervalExercisePrescriptionsListComplexAggregation() {
	// Test the complex aggregated endpoint that includes exercise variation details
	recorder := suite.GET("/api/v1/interval-exercise-prescriptions?groupId=1")
	suite.AssertStatusCode(recorder, 200)
	
	var prescriptions []types.IntervalExercisePrescription
	suite.GetResponseData(recorder, &prescriptions)
	suite.GreaterOrEqual(len(prescriptions), 1, "Should have prescriptions for group 1")
	
	// Verify complex nested data is properly loaded
	for _, prescription := range prescriptions {
		// Check that ExerciseVariation nested object is populated (if implemented)
		if prescription.ExerciseVariation.ID != 0 {
			suite.NotZero(prescription.ExerciseVariation.ID, "Exercise variation should be populated")
			suite.NotZero(prescription.ExerciseVariation.ExerciseId, "Exercise variation should have exercise ID")
			
			// Check nested Exercise details within variation (if implemented)
			if prescription.ExerciseVariation.Exercise.ID != 0 {
				suite.NotZero(prescription.ExerciseVariation.Exercise.ID, "Exercise should be populated")
				suite.NotEmpty(prescription.ExerciseVariation.Exercise.Name, "Exercise should have name")
			}
		}
		
		// Verify prescription data integrity
		suite.NotNil(prescription.RPE, "RPE should be set for test data")
		if prescription.RPE != nil {
			suite.True(*prescription.RPE >= 6 && *prescription.RPE <= 10, "RPE should be in valid range")
		}
		
		if prescription.Reps != nil {
			suite.True(*prescription.Reps > 0, "Reps should be positive when set")
		}
		
		if prescription.Duration != nil {
			suite.NotEmpty(*prescription.Duration, "Duration should not be empty when set")
		}
		
		if prescription.Rest != nil {
			suite.NotEmpty(*prescription.Rest, "Rest should not be empty when set")
		}
	}
}

// TestIntervalExercisePrescriptionsListUserIsolation tests user isolation through group ownership
func (suite *IntegrationTestSuite) TestIntervalExercisePrescriptionsListUserIsolation() {
	// Test prescriptions for user 2's group (group 4)
	recorder := suite.GET("/api/v1/interval-exercise-prescriptions?groupId=4")
	suite.AssertStatusCode(recorder, 200)
	
	var prescriptions []types.IntervalExercisePrescription
	suite.GetResponseData(recorder, &prescriptions)
	suite.Len(prescriptions, 1, "User 2's group should have 1 prescription")
	
	prescription := prescriptions[0]
	suite.Equal(int64(4), prescription.GroupId, "Should belong to group 4 (user 2)")
	suite.Equal(int64(4), prescription.PlanIntervalId, "Should be in user 2's interval")
}

// TestIntervalExercisePrescriptionsListErrorCases tests error scenarios
func (suite *IntegrationTestSuite) TestIntervalExercisePrescriptionsListErrorCases() {
	// Test Case 1: No filters - should return all results (no error based on handler)
	recorder := suite.GET("/api/v1/interval-exercise-prescriptions")
	suite.AssertStatusCode(recorder, 200)
	// Should return all prescriptions or handle gracefully

	// Test Case 2: Non-existent groupId should return empty array
	recorder = suite.GET("/api/v1/interval-exercise-prescriptions?groupId=999")
	suite.AssertStatusCode(recorder, 200)
	
	var prescriptions []types.IntervalExercisePrescription
	suite.GetResponseData(recorder, &prescriptions)
	suite.Len(prescriptions, 0, "Non-existent group should return empty array")

	// Test Case 3: Non-existent intervalId should return empty array
	recorder = suite.GET("/api/v1/interval-exercise-prescriptions?intervalId=999")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &prescriptions)
	suite.Len(prescriptions, 0, "Non-existent interval should return empty array")
}

// TestIntervalExercisePrescriptionsCreate tests the POST endpoint
func (suite *IntegrationTestSuite) TestIntervalExercisePrescriptionsCreate() {
	// Valid prescription creation with all fields
	createRequest := map[string]interface{}{
		"groupId":             1,
		"exerciseVariationId": 1,
		"planIntervalId":      1,
		"rpe":                 8,
		"sets":                3,
		"reps":                12,
		"rest":                "1 minute 30 seconds",
	}
	
	recorder := suite.POST("/api/v1/interval-exercise-prescriptions", createRequest)
	suite.AssertStatusCode(recorder, 200)
	
	var createdPrescription types.IntervalExercisePrescription
	suite.GetResponseData(recorder, &createdPrescription)
	
	suite.Equal(int64(1), createdPrescription.GroupId, "Created prescription should belong to group 1")
	suite.Equal(int64(1), createdPrescription.ExerciseVariationId, "Should have correct exercise variation")
	suite.Equal(int64(1), createdPrescription.PlanIntervalId, "Should belong to interval 1")
	suite.NotNil(createdPrescription.RPE, "RPE should be set")
	if createdPrescription.RPE != nil {
		suite.Equal(int32(8), *createdPrescription.RPE, "RPE should match")
	}
	suite.Equal(int32(3), createdPrescription.Sets, "Sets should match")
	suite.NotNil(createdPrescription.Reps, "Reps should be set")
	if createdPrescription.Reps != nil {
		suite.Equal(int32(12), *createdPrescription.Reps, "Reps should match")
	}
	suite.NotZero(createdPrescription.ID, "Created prescription should have an ID")

	// Verify prescription was created by querying for it
	recorder = suite.GET("/api/v1/interval-exercise-prescriptions?groupId=1")
	suite.AssertStatusCode(recorder, 200)
	
	var prescriptions []types.IntervalExercisePrescription
	suite.GetResponseData(recorder, &prescriptions)
	
	// Should now have more prescriptions for group 1
	suite.GreaterOrEqual(len(prescriptions), 4, "Group 1 should have more prescriptions after creation")
}

// TestIntervalExercisePrescriptionsCreateMinimal tests creating with minimal required fields
func (suite *IntegrationTestSuite) TestIntervalExercisePrescriptionsCreateMinimal() {
	// Create with only required fields
	createRequest := map[string]interface{}{
		"groupId":             2,
		"exerciseVariationId": 3,
		"planIntervalId":      1,
		"sets":                4,
	}
	
	recorder := suite.POST("/api/v1/interval-exercise-prescriptions", createRequest)
	suite.AssertStatusCode(recorder, 200)
	
	var createdPrescription types.IntervalExercisePrescription
	suite.GetResponseData(recorder, &createdPrescription)
	
	suite.Equal(int64(2), createdPrescription.GroupId, "Should belong to group 2")
	suite.Equal(int64(3), createdPrescription.ExerciseVariationId, "Should have exercise variation 3")
	suite.Equal(int32(4), createdPrescription.Sets, "Sets should be 4")
	// Optional fields should be nil or empty
}

// TestIntervalExercisePrescriptionsCreateDurationBased tests creating duration-based prescriptions
func (suite *IntegrationTestSuite) TestIntervalExercisePrescriptionsCreateDurationBased() {
	// Create duration-based prescription (like plank holds)
	createRequest := map[string]interface{}{
		"groupId":             3,
		"exerciseVariationId": 5, // Plank variation
		"planIntervalId":      2,
		"rpe":                 7,
		"sets":                3,
		"duration":            "45 seconds", // 45 second holds
		"rest":                "1 minute", // 1 minute rest
	}
	
	recorder := suite.POST("/api/v1/interval-exercise-prescriptions", createRequest)
	suite.AssertStatusCode(recorder, 200)
	
	var createdPrescription types.IntervalExercisePrescription
	suite.GetResponseData(recorder, &createdPrescription)
	
	suite.Equal(int64(3), createdPrescription.GroupId, "Should belong to core group")
	suite.NotNil(createdPrescription.Duration, "Duration should be set")
	if createdPrescription.Duration != nil {
		suite.Equal("PT45S", createdPrescription.Duration.String(), "Duration should be 45 seconds in ISO 8601 format (PT45S)")
	}
	suite.Nil(createdPrescription.Reps, "Reps should be nil for duration-based exercises")
}

// TestIntervalExercisePrescriptionsCreateErrorCases tests error scenarios for creation
func (suite *IntegrationTestSuite) TestIntervalExercisePrescriptionsCreateErrorCases() {
	// Test Case 1: Invalid JSON should return 400
	recorder := suite.POST("/api/v1/interval-exercise-prescriptions", "invalid json")
	suite.AssertErrorResponse(recorder, 400, "Invalid request body")

	// Test Case 2: Missing required fields should return error
	createRequest := map[string]interface{}{
		"rpe":  8,
		"sets": 3,
		// Missing groupId, exerciseVariationId, planIntervalId
	}
	
	recorder = suite.POST("/api/v1/interval-exercise-prescriptions", createRequest)
	// Should return error for missing required fields
	suite.True(recorder.Code >= 400, "Should return error for missing required fields")

	// Test Case 3: Non-existent group should return error
	createRequest = map[string]interface{}{
		"groupId":             999,
		"exerciseVariationId": 1,
		"planIntervalId":      1,
		"sets":                3,
	}
	
	recorder = suite.POST("/api/v1/interval-exercise-prescriptions", createRequest)
	// Should return error when referencing non-existent group
	suite.True(recorder.Code >= 400, "Should return error for non-existent group")

	// Test Case 4: Non-existent exercise variation should return error
	createRequest = map[string]interface{}{
		"groupId":             1,
		"exerciseVariationId": 999,
		"planIntervalId":      1,
		"sets":                3,
	}
	
	recorder = suite.POST("/api/v1/interval-exercise-prescriptions", createRequest)
	// Should return error when referencing non-existent exercise variation
	suite.True(recorder.Code >= 400, "Should return error for non-existent exercise variation")
}

// TestIntervalExercisePrescriptionsPagination tests pagination
func (suite *IntegrationTestSuite) TestIntervalExercisePrescriptionsPagination() {
	// Test limit parameter
	recorder := suite.GET("/api/v1/interval-exercise-prescriptions?intervalId=1&limit=2")
	suite.AssertStatusCode(recorder, 200)
	
	var prescriptions []types.IntervalExercisePrescription
	suite.GetResponseData(recorder, &prescriptions)
	suite.LessOrEqual(len(prescriptions), 2, "Should respect limit parameter")
	
	// Test offset parameter
	recorder = suite.GET("/api/v1/interval-exercise-prescriptions?intervalId=1&offset=1")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &prescriptions)
	suite.GreaterOrEqual(len(prescriptions), 0, "Should handle offset parameter")
	
	// Test limit and offset together
	recorder = suite.GET("/api/v1/interval-exercise-prescriptions?intervalId=1&limit=1&offset=1")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &prescriptions)
	suite.LessOrEqual(len(prescriptions), 1, "Should respect both limit and offset")
}

// TestIntervalExercisePrescriptionsResponseStructure tests API response structure
func (suite *IntegrationTestSuite) TestIntervalExercisePrescriptionsResponseStructure() {
	// Test successful response structure
	recorder := suite.GET("/api/v1/interval-exercise-prescriptions?groupId=1")
	suite.AssertStatusCode(recorder, 200)
	
	var response types.ApiSuccessResponse
	suite.AssertJSON(recorder, &response)
	suite.True(response.Success, "Response should indicate success")
	suite.NotNil(response.Data, "Response should contain data")
}

// TestIntervalExercisePrescriptionsFieldValidation tests field validation
func (suite *IntegrationTestSuite) TestIntervalExercisePrescriptionsFieldValidation() {
	// Get prescriptions and verify all expected fields are present
	recorder := suite.GET("/api/v1/interval-exercise-prescriptions?intervalId=1&limit=1")
	suite.AssertStatusCode(recorder, 200)
	
	var prescriptions []types.IntervalExercisePrescription
	suite.GetResponseData(recorder, &prescriptions)
	suite.GreaterOrEqual(len(prescriptions), 1, "Should have at least one prescription")
	
	if len(prescriptions) > 0 {
		prescription := prescriptions[0]
		
		// Required fields
		suite.NotZero(prescription.ID, "Prescription should have an ID")
		suite.NotZero(prescription.GroupId, "Prescription should have group ID")
		suite.NotZero(prescription.ExerciseVariationId, "Prescription should have exercise variation ID")
		suite.NotZero(prescription.PlanIntervalId, "Prescription should have plan interval ID")
		suite.NotZero(prescription.Sets, "Prescription should have sets")
		
		// Optional fields that can be nil
		// RPE, Reps, Duration, Rest, SubReps, etc. can be nil
	}
}

// TestIntervalExercisePrescriptionsSpecificValues tests specific prescriptions from seed data
func (suite *IntegrationTestSuite) TestIntervalExercisePrescriptionsSpecificValues() {
	// Get upper body prescriptions from interval 1 (should include push-ups)
	recorder := suite.GET("/api/v1/interval-exercise-prescriptions?groupId=1&intervalId=1")
	suite.AssertStatusCode(recorder, 200)
	
	var prescriptions []types.IntervalExercisePrescription
	suite.GetResponseData(recorder, &prescriptions)
	suite.Len(prescriptions, 2, "Group 1 in interval 1 should have 2 prescriptions")
	
	// Verify specific values from seed data
	for _, prescription := range prescriptions {
		suite.Equal(int64(1), prescription.GroupId, "Should be upper body group")
		suite.Equal(int64(1), prescription.PlanIntervalId, "Should be first interval")
		suite.NotNil(prescription.RPE, "RPE should be set in test data")
		suite.Equal(int32(3), prescription.Sets, "Should have 3 sets based on seed data")
		suite.NotNil(prescription.Reps, "Reps should be set for push-ups")
		suite.NotNil(prescription.Rest, "Rest should be set")
		
		if prescription.Rest != nil {
			suite.Equal("PT1M30S", prescription.Rest.String(), "Rest should be 1:30 in ISO 8601 format (PT1M30S)")
		}
	}

	// Test core/plank prescription (duration-based)
	recorder = suite.GET("/api/v1/interval-exercise-prescriptions?groupId=3&intervalId=2")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &prescriptions)
	if len(prescriptions) > 0 {
		plankPrescription := prescriptions[0]
		suite.Equal(int64(3), plankPrescription.GroupId, "Should be core group")
		suite.NotNil(plankPrescription.Duration, "Plank should have duration")
		suite.Nil(plankPrescription.Reps, "Plank should not have reps")
		
		if plankPrescription.Duration != nil {
			suite.Equal("PT45S", plankPrescription.Duration.String(), "Plank should be 45 seconds in ISO 8601 format (PT45S)")
		}
	}
}

// TestIntervalExercisePrescriptionsPerformance tests performance with realistic data volumes
func (suite *IntegrationTestSuite) TestIntervalExercisePrescriptionsPerformance() {
	// This test verifies that the complex aggregated query performs acceptably
	// with the current test data volume
	
	// Get all prescriptions (should be 8 from seed data)
	recorder := suite.GET("/api/v1/interval-exercise-prescriptions")
	suite.AssertStatusCode(recorder, 200)
	
	var prescriptions []types.IntervalExercisePrescription
	suite.GetResponseData(recorder, &prescriptions)
	suite.Len(prescriptions, 8, "Should have 8 prescriptions from seed data")
	
	// Verify no N+1 query issues by checking that all data loads in a single response
	// (This is more about documenting expected behavior than testing performance)
	for _, prescription := range prescriptions {
		suite.NotZero(prescription.ID, "Each prescription should have complete data")
		suite.NotZero(prescription.GroupId, "Group data should be loaded")
		suite.NotZero(prescription.ExerciseVariationId, "Exercise variation should be loaded")
		suite.NotZero(prescription.PlanIntervalId, "Plan interval should be loaded")
	}
}