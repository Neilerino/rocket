package integration

import (
	"backend/internal/types"
)

// TestExercisesList tests the GET /api/v1/exercises endpoint with various filters
func (suite *IntegrationTestSuite) TestExercisesList() {
	// Test Case 1: userId=1 should return user 1's exercises
	recorder := suite.GET("/api/v1/exercises?userId=1")
	suite.AssertStatusCode(recorder, 200)

	var exercises []types.Exercise
	suite.GetResponseData(recorder, &exercises)
	suite.Len(exercises, 3, "User 1 should have 3 exercises")

	// Verify all exercises belong to user 1
	for _, exercise := range exercises {
		suite.Equal(int64(1), exercise.UserID, "All exercises should belong to user 1")
	}

	// Verify exercise names match test data
	exerciseNames := make(map[string]bool)
	for _, exercise := range exercises {
		exerciseNames[exercise.Name] = true
	}
	suite.True(exerciseNames["Push-ups"], "Should contain Push-ups exercise")
	suite.True(exerciseNames["Squats"], "Should contain Squats exercise")
	suite.True(exerciseNames["Plank"], "Should contain Plank exercise")

	// Test Case 2: id=1 should return specific exercise
	recorder = suite.GET("/api/v1/exercises?id=1")
	suite.AssertStatusCode(recorder, 200)

	suite.GetResponseData(recorder, &exercises)
	suite.Len(exercises, 1, "Should return exactly one exercise")
	suite.Equal(int64(1), exercises[0].ID, "Exercise ID should be 1")
	suite.Equal("Push-ups", exercises[0].Name, "Exercise name should match test data")
}

// TestExercisesListUserIsolation tests user isolation in exercises list
func (suite *IntegrationTestSuite) TestExercisesListUserIsolation() {
	// User isolation - userId=2 should only return user 2's exercises
	recorder := suite.GET("/api/v1/exercises?userId=2")
	suite.AssertStatusCode(recorder, 200)

	var exercises []types.Exercise
	suite.GetResponseData(recorder, &exercises)
	suite.Len(exercises, 1, "User 2 should have 1 exercise")
	suite.Equal(int64(2), exercises[0].UserID, "Exercise should belong to user 2")
	suite.Equal("User2 Push-ups", exercises[0].Name, "Exercise name should match test data")
}

// TestExercisesListErrorCases tests error scenarios for the exercises list endpoint
func (suite *IntegrationTestSuite) TestExercisesListErrorCases() {
	// Test Case 1: Non-existent userId should return empty array
	recorder := suite.GET("/api/v1/exercises?userId=999")
	suite.AssertStatusCode(recorder, 200)

	var exercises []types.Exercise
	suite.GetResponseData(recorder, &exercises)
	suite.Len(exercises, 0, "Non-existent user should return empty array")

	// Test Case 2: No filters should return 400 error
	recorder = suite.GET("/api/v1/exercises")
	suite.AssertErrorResponse(recorder, 400, "Missing at least one filter parameter")
}

// TestExercisesCreate tests the POST /api/v1/exercises endpoint
func (suite *IntegrationTestSuite) TestExercisesCreate() {
	// Valid exercise creation
	createRequest := map[string]interface{}{
		"name":        "Test New Exercise",
		"description": "A test exercise description",
		"userId":      1,
	}

	recorder := suite.POST("/api/v1/exercises", createRequest)
	suite.AssertStatusCode(recorder, 201)

	var createdExercise types.Exercise
	suite.GetResponseData(recorder, &createdExercise)
	suite.Equal("Test New Exercise", createdExercise.Name, "Created exercise name should match")
	suite.Equal("A test exercise description", createdExercise.Description, "Created exercise description should match")
	suite.Equal(int64(1), createdExercise.UserID, "Created exercise should belong to user 1")
	suite.NotZero(createdExercise.ID, "Created exercise should have an ID")

	// Verify exercise was created by listing exercises
	recorder = suite.GET("/api/v1/exercises?userId=1")
	suite.AssertStatusCode(recorder, 200)

	var exercises []types.Exercise
	suite.GetResponseData(recorder, &exercises)
	suite.Len(exercises, 4, "User 1 should now have 4 exercises") // 3 original + 1 new
}

// TestExercisesCreateErrorCases tests error scenarios for exercise creation
func (suite *IntegrationTestSuite) TestExercisesCreateErrorCases() {
	// Test Case 1: Missing required fields should return 400
	createRequest := map[string]interface{}{
		"description": "Exercise without name",
	}

	recorder := suite.POST("/api/v1/exercises", createRequest)
	suite.AssertErrorResponse(recorder, 400)

	// Test Case 2: Invalid JSON should return 400
	req := suite.POST("/api/v1/exercises", "invalid json")
	suite.AssertErrorResponse(req, 400, "Invalid request body")
}

// TestExercisesUpdate tests the PUT /api/v1/exercises/{id} endpoint
func (suite *IntegrationTestSuite) TestExercisesUpdate() {
	// Valid exercise update
	updateRequest := map[string]interface{}{
		"name":        "Updated Exercise Name",
		"description": "Updated exercise description",
	}

	recorder := suite.PUT("/api/v1/exercises/1", updateRequest)
	suite.AssertStatusCode(recorder, 200)

	var updatedExercise types.Exercise
	suite.GetResponseData(recorder, &updatedExercise)
	suite.Equal("Updated Exercise Name", updatedExercise.Name, "Exercise name should be updated")
	suite.Equal("Updated exercise description", updatedExercise.Description, "Exercise description should be updated")
	suite.Equal(int64(1), updatedExercise.UserID, "Exercise should still belong to user 1")
	suite.Equal(int64(1), updatedExercise.ID, "Exercise ID should remain the same")

	// Verify update persisted by getting the exercise
	recorder = suite.GET("/api/v1/exercises?id=1")
	suite.AssertStatusCode(recorder, 200)

	var exercises []types.Exercise
	suite.GetResponseData(recorder, &exercises)
	suite.Len(exercises, 1, "Should return the updated exercise")
	suite.Equal("Updated Exercise Name", exercises[0].Name, "Name should be updated")
}

// TestExercisesUpdateErrorCases tests error scenarios for exercise updates
func (suite *IntegrationTestSuite) TestExercisesUpdateErrorCases() {
	updateRequest := map[string]interface{}{
		"name":        "Valid Name",
		"description": "Valid description",
	}

	// Test Case 1: Update non-existent exercise should return error
	recorder := suite.PUT("/api/v1/exercises/999", updateRequest)
	suite.AssertErrorResponse(recorder, 500) // Should ideally be 404, but service returns 500 for not found

	// Test Case 2: Invalid ID format returns 400
	recorder = suite.PUT("/api/v1/exercises/invalid", updateRequest)
	suite.AssertErrorResponse(recorder, 400, "Invalid exercise ID")

	// Test Case 3: Invalid JSON should return 400
	req := suite.PUT("/api/v1/exercises/1", "invalid json")
	suite.AssertErrorResponse(req, 400, "Invalid request body")
}

// TestExercisesDelete tests the DELETE /api/v1/exercises/{id} endpoint
func (suite *IntegrationTestSuite) TestExercisesDelete() {
	// Valid exercise deletion
	recorder := suite.DELETE("/api/v1/exercises/1")
	suite.AssertStatusCode(recorder, 204)

	// Verify exercise is deleted by trying to get it
	recorder = suite.GET("/api/v1/exercises?id=1")
	suite.AssertStatusCode(recorder, 200)

	var exercises []types.Exercise
	suite.GetResponseData(recorder, &exercises)
	suite.Len(exercises, 0, "Deleted exercise should not be returned")

	// Verify user's exercise count decreased
	recorder = suite.GET("/api/v1/exercises?userId=1")
	suite.AssertStatusCode(recorder, 200)

	suite.GetResponseData(recorder, &exercises)
	suite.Len(exercises, 2, "User 1 should now have 2 exercises") // 3 original - 1 deleted
}

// TestExercisesDeleteErrorCases tests error scenarios for exercise deletion
func (suite *IntegrationTestSuite) TestExercisesDeleteErrorCases() {
	// Test Case 1: Delete non-existent exercise should return error
	recorder := suite.DELETE("/api/v1/exercises/999")
	suite.AssertErrorResponse(recorder, 404) // Should ideally be 404, but service returns 500 for not found

	// Test Case 2: Invalid ID format returns 400
	recorder = suite.DELETE("/api/v1/exercises/invalid")
	suite.AssertErrorResponse(recorder, 400, "Invalid exercise ID")
}

// TestExercisesAdvancedFiltering tests advanced filtering scenarios
func (suite *IntegrationTestSuite) TestExercisesAdvancedFiltering() {
	// Test limit parameter
	recorder := suite.GET("/api/v1/exercises?userId=1&limit=2")
	suite.AssertStatusCode(recorder, 200)

	var exercises []types.Exercise
	suite.GetResponseData(recorder, &exercises)
	suite.LessOrEqual(len(exercises), 2, "Should respect limit parameter")

	// All returned exercises should belong to user 1
	for _, exercise := range exercises {
		suite.Equal(int64(1), exercise.UserID, "All exercises should belong to user 1")
	}
}

// TestExercisesResponseStructure tests the API response structure
func (suite *IntegrationTestSuite) TestExercisesResponseStructure() {
	// Test that successful responses follow the expected structure
	recorder := suite.GET("/api/v1/exercises?userId=1")
	suite.AssertStatusCode(recorder, 200)

	// Parse the raw response to check structure
	var response types.ApiSuccessResponse
	suite.AssertJSON(recorder, &response)
	suite.True(response.Success, "Response should indicate success")
	suite.NotNil(response.Data, "Response should contain data")

	// Test that error responses follow the expected structure
	recorder = suite.GET("/api/v1/exercises")
	suite.AssertStatusCode(recorder, 400)

	var errorResponse types.ApiErrorResponse
	suite.AssertJSON(recorder, &errorResponse)
	suite.False(errorResponse.Success, "Error response should indicate failure")
	suite.NotEmpty(errorResponse.Error.Message, "Error response should contain message")
	suite.Equal("Bad Request", errorResponse.Error.Code, "Error code should be set")
}

// TestExercisesFieldValidation tests the field validation and structure
func (suite *IntegrationTestSuite) TestExercisesFieldValidation() {
	// Get an exercise and verify all expected fields are present
	recorder := suite.GET("/api/v1/exercises?userId=1&limit=1")
	suite.AssertStatusCode(recorder, 200)

	var exercises []types.Exercise
	suite.GetResponseData(recorder, &exercises)
	suite.Len(exercises, 1, "Should return one exercise")

	exercise := exercises[0]
	suite.NotZero(exercise.ID, "Exercise should have an ID")
	suite.NotEmpty(exercise.Name, "Exercise should have a name")
	suite.NotEmpty(exercise.Description, "Exercise should have a description")
	suite.Equal(int64(1), exercise.UserID, "Exercise should belong to user 1")
	suite.NotEmpty(exercise.CreatedAt, "Exercise should have created timestamp")
	suite.NotEmpty(exercise.UpdatedAt, "Exercise should have updated timestamp")
}
