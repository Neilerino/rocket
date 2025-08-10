package integration

import (
	"backend/internal/types"
)

// TestPlansList tests the GET /api/v1/plans endpoint with various filters
func (suite *IntegrationTestSuite) TestPlansList() {
	// Test Case 1: userId=1 should return 4 plans
	recorder := suite.GET("/api/v1/plans?userId=1")
	suite.AssertStatusCode(recorder, 200)

	var plans []types.Plan
	suite.GetResponseData(recorder, &plans)
	suite.Len(plans, 4, "User 1 should have 4 plans")

	// Verify all plans belong to user 1
	for _, plan := range plans {
		suite.Equal(int64(1), plan.UserID, "All plans should belong to user 1")
	}

	// Test Case 2: userId=1&isTemplate=true should return 2 template plans
	recorder = suite.GET("/api/v1/plans?userId=1&isTemplate=true")
	suite.AssertStatusCode(recorder, 200)

	suite.GetResponseData(recorder, &plans)
	suite.Len(plans, 2, "User 1 should have 2 template plans")

	// Verify all plans are templates
	for _, plan := range plans {
		suite.True(plan.IsTemplate, "All returned plans should be templates")
		suite.Equal(int64(1), plan.UserID, "All plans should belong to user 1")
	}

	// Test Case 3: userId=1&isPublic=true should return 2 public plans
	recorder = suite.GET("/api/v1/plans?userId=1&isPublic=true")
	suite.AssertStatusCode(recorder, 200)

	suite.GetResponseData(recorder, &plans)
	suite.Len(plans, 2, "User 1 should have 2 public plans")

	// Verify all plans are public
	for _, plan := range plans {
		suite.True(plan.IsPublic, "All returned plans should be public")
		suite.Equal(int64(1), plan.UserID, "All plans should belong to user 1")
	}

	// Test Case 4: userId=1&isTemplate=true&isPublic=true should return 1 plan
	recorder = suite.GET("/api/v1/plans?userId=1&isTemplate=true&isPublic=true")
	suite.AssertStatusCode(recorder, 200)

	suite.GetResponseData(recorder, &plans)
	suite.Len(plans, 1, "User 1 should have 1 public template plan")

	// Verify the plan is both template and public
	plan := plans[0]
	suite.True(plan.IsTemplate, "Plan should be a template")
	suite.True(plan.IsPublic, "Plan should be public")
	suite.Equal(int64(1), plan.UserID, "Plan should belong to user 1")
	suite.Equal("User1 Public Template", plan.Name, "Plan name should match test data")

	// Test Case 5: planId=1 should return single plan
	recorder = suite.GET("/api/v1/plans?id=1")
	suite.AssertStatusCode(recorder, 200)

	suite.GetResponseData(recorder, &plans)
	suite.Len(plans, 1, "Should return exactly one plan")
	suite.Equal(int64(1), plans[0].ID, "Plan ID should be 1")
	suite.Equal("User1 Regular Plan", plans[0].Name, "Plan name should match test data")
}

// TestPlansListErrorCases tests error scenarios for the plans list endpoint
func (suite *IntegrationTestSuite) TestPlansListErrorCases() {
	// Test Case 1: Non-existent userId should return empty array
	recorder := suite.GET("/api/v1/plans?userId=999")
	suite.AssertStatusCode(recorder, 200)

	var plans []types.Plan
	suite.GetResponseData(recorder, &plans)
	suite.Len(plans, 0, "Non-existent user should return empty array")

	// Test Case 2: No filters should return 400 error
	recorder = suite.GET("/api/v1/plans")
	suite.AssertErrorResponse(recorder, 400, "Missing required filter")
}

// TestPlansListUserIsolation tests user isolation in plans list
func (suite *IntegrationTestSuite) TestPlansListUserIsolation() {
	// User isolation - userId=2 should only return user 2's plans
	recorder := suite.GET("/api/v1/plans?userId=2")
	suite.AssertStatusCode(recorder, 200)

	var plans []types.Plan
	suite.GetResponseData(recorder, &plans)
	suite.Len(plans, 1, "User 2 should have 1 plan")
	suite.Equal(int64(2), plans[0].UserID, "Plan should belong to user 2")
	suite.Equal("User2 Plan", plans[0].Name, "Plan name should match test data")
}

// TestPlansGetById tests the GET /api/v1/plans/{id} endpoint
func (suite *IntegrationTestSuite) TestPlansGetById() {
	// Test Case 1: Valid ID returns correct plan
	recorder := suite.GET("/api/v1/plans?id=1")
	suite.AssertStatusCode(recorder, 200)

	var plans []types.Plan
	suite.GetResponseData(recorder, &plans)
	suite.Len(plans, 1, "User 1 should have 1 plan")
	suite.Equal(int64(1), plans[0].ID, "Plan ID should be 1")
	suite.Equal("User1 Regular Plan", plans[0].Name, "Plan name should match test data")
	suite.Equal(int64(1), plans[0].UserID, "Plan should belong to user 1")
	suite.False(plans[0].IsTemplate, "Plan should not be a template")
	suite.False(plans[0].IsPublic, "Plan should not be public")

	// Test Case 2: Access to existing plan by different user (plan 5 belongs to user 2)
	recorder = suite.GET("/api/v1/plans?id=5")
	suite.AssertStatusCode(recorder, 200)

	suite.GetResponseData(recorder, &plans)
	suite.Len(plans, 1, "User 2 should have 1 plan")
	suite.Equal(int64(5), plans[0].ID, "Plan ID should be 5")
	suite.Equal("User2 Plan", plans[0].Name, "Plan name should match test data")
	suite.Equal(int64(2), plans[0].UserID, "Plan should belong to user 2")
}

// TestPlansGetByIdErrorCases tests error scenarios for the plans get by id endpoint
func (suite *IntegrationTestSuite) TestPlansGetByIdErrorCases() {
	// Test Case 1: Invalid ID returns 404
	recorder := suite.GET("/api/v1/plans?id=999")
	suite.AssertErrorResponse(recorder, 404)

	// Test Case 2: Invalid ID format returns 400
	recorder = suite.GET("/api/v1/plans?id=invalid")
	suite.AssertErrorResponse(recorder, 400)
}

// TestPlansCreate tests the POST /api/v1/plans endpoint
func (suite *IntegrationTestSuite) TestPlansCreate() {
	// Test Case 1: Valid plan creation
	createRequest := map[string]any{
		"name":        "Test New Plan",
		"description": "A test plan description",
		"userId":      1,
		"isTemplate":  false,
		"isPublic":    false,
	}

	recorder := suite.POST("/api/v1/plans", createRequest)
	suite.AssertStatusCode(recorder, 201)

	var createdPlan types.Plan
	suite.GetResponseData(recorder, &createdPlan)
	suite.Equal("Test New Plan", createdPlan.Name, "Created plan name should match")
	suite.Equal("A test plan description", createdPlan.Description, "Created plan description should match")
	suite.Equal(int64(1), createdPlan.UserID, "Created plan should belong to user 1")
	suite.False(createdPlan.IsTemplate, "Created plan should not be a template")
	suite.False(createdPlan.IsPublic, "Created plan should not be public")
	suite.NotZero(createdPlan.ID, "Created plan should have an ID")
}

// TestPlansCreateTemplate tests creating template plans
func (suite *IntegrationTestSuite) TestPlansCreateTemplate() {
	// Create template plan
	createRequest := map[string]any{
		"name":        "Test Template Plan",
		"description": "A test template plan",
		"userId":      1,
		"isTemplate":  true,
		"isPublic":    false,
	}

	recorder := suite.POST("/api/v1/plans", createRequest)
	suite.AssertStatusCode(recorder, 201)

	var createdPlan types.Plan
	suite.GetResponseData(recorder, &createdPlan)
	suite.True(createdPlan.IsTemplate, "Created plan should be a template")
	suite.False(createdPlan.IsPublic, "Created plan should not be public")
}

// TestPlansCreatePublic tests creating public plans
func (suite *IntegrationTestSuite) TestPlansCreatePublic() {
	// Create public plan
	createRequest := map[string]any{
		"name":        "Test Public Plan",
		"description": "A test public plan",
		"userId":      1,
		"isTemplate":  false,
		"isPublic":    true,
	}

	recorder := suite.POST("/api/v1/plans", createRequest)
	suite.AssertStatusCode(recorder, 201)

	var createdPlan types.Plan
	suite.GetResponseData(recorder, &createdPlan)
	suite.False(createdPlan.IsTemplate, "Created plan should not be a template")
	suite.True(createdPlan.IsPublic, "Created plan should be public")
}

// TestPlansCreateErrorCases tests error scenarios for plan creation
func (suite *IntegrationTestSuite) TestPlansCreateErrorCases() {
	// Test Case 1: Missing name field returns 400
	createRequest := map[string]any{
		"description": "A plan without name",
		"userId":      1,
		"isTemplate":  false,
		"isPublic":    false,
	}

	recorder := suite.POST("/api/v1/plans", createRequest)
	suite.AssertErrorResponse(recorder, 400, "Missing required field: name")

	// Test Case 2: Invalid userId returns 400
	createRequest = map[string]any{
		"name":        "Test Plan",
		"description": "A plan with invalid userId",
		"userId":      0,
		"isTemplate":  false,
		"isPublic":    false,
	}

	recorder = suite.POST("/api/v1/plans", createRequest)
	suite.AssertErrorResponse(recorder, 400, "Invalid or missing userId")
}

// TestPlansUpdate tests the PUT /api/v1/plans/{id} endpoint
func (suite *IntegrationTestSuite) TestPlansUpdate() {
	// Valid plan update
	updateRequest := map[string]any{
		"name":        "Updated Plan Name",
		"description": "Updated plan description",
		"userId":      1, // This is required in the struct but shouldn't change ownership
		"isTemplate":  true,
		"isPublic":    true,
	}

	recorder := suite.PUT("/api/v1/plans/1", updateRequest)
	suite.AssertStatusCode(recorder, 200)

	var updatedPlan types.Plan
	suite.GetResponseData(recorder, &updatedPlan)
	suite.Equal("Updated Plan Name", updatedPlan.Name, "Plan name should be updated")
	suite.Equal("Updated plan description", updatedPlan.Description, "Plan description should be updated")
	suite.Equal(int64(1), updatedPlan.UserID, "Plan should still belong to user 1")
	suite.True(updatedPlan.IsTemplate, "Plan should now be a template")
	suite.True(updatedPlan.IsPublic, "Plan should now be public")
}

// TestPlansUpdateErrorCases tests error scenarios for plan updates
func (suite *IntegrationTestSuite) TestPlansUpdateErrorCases() {
	updateRequest := map[string]any{
		"name":        "Valid Name",
		"description": "Valid description",
		"userId":      1,
		"isTemplate":  false,
		"isPublic":    false,
	}

	// Test Case 1: Update non-existent plan returns 404
	recorder := suite.PUT("/api/v1/plans/999", updateRequest)
	suite.AssertErrorResponse(recorder, 404)

	// Test Case 2: Invalid ID format returns 400
	recorder = suite.PUT("/api/v1/plans/invalid", updateRequest)
	suite.AssertErrorResponse(recorder, 400, "Invalid plan ID")

	// Test Case 3: Missing name field returns 400
	updateRequest = map[string]any{
		"description": "Description without name",
		"userId":      1,
		"isTemplate":  false,
		"isPublic":    false,
	}

	recorder = suite.PUT("/api/v1/plans/2", updateRequest)
	suite.AssertErrorResponse(recorder, 400, "Missing required field: name")
}

// TestPlansDelete tests the DELETE /api/v1/plans/{id} endpoint
func (suite *IntegrationTestSuite) TestPlansDelete() {
	// Valid plan deletion
	recorder := suite.DELETE("/api/v1/plans/1")
	suite.AssertStatusCode(recorder, 204)

	// Verify plan is deleted by trying to get it
	recorder = suite.GET("/api/v1/plans?id=1")
	suite.AssertErrorResponse(recorder, 404)
}

// TestPlansDeleteErrorCases tests error scenarios for plan deletion
func (suite *IntegrationTestSuite) TestPlansDeleteErrorCases() {
	// Test Case 1: Delete non-existent plan returns 404
	recorder := suite.DELETE("/api/v1/plans/999")
	suite.AssertErrorResponse(recorder, 404)

	// Test Case 2: Invalid ID format returns 400
	recorder = suite.DELETE("/api/v1/plans/invalid")
	suite.AssertErrorResponse(recorder, 400, "Invalid plan ID")
}

// TestPlansPagination tests pagination for plans list
func (suite *IntegrationTestSuite) TestPlansPagination() {
	// Test limit parameter
	recorder := suite.GET("/api/v1/plans?userId=1&limit=2")
	suite.AssertStatusCode(recorder, 200)

	var plans []types.Plan
	suite.GetResponseData(recorder, &plans)
	suite.LessOrEqual(len(plans), 2, "Should respect limit parameter")

	// Test offset parameter
	recorder = suite.GET("/api/v1/plans?userId=1&offset=1")
	suite.AssertStatusCode(recorder, 200)

	suite.GetResponseData(recorder, &plans)
	suite.LessOrEqual(len(plans), 3, "Should skip first plan with offset=1")
}

// TestPlansAdvancedFiltering tests advanced filtering scenarios
func (suite *IntegrationTestSuite) TestPlansAdvancedFiltering() {
	// Test with planId filter takes precedence
	recorder := suite.GET("/api/v1/plans?id=5&userId=1")
	suite.AssertStatusCode(recorder, 200)

	var plans []types.Plan
	suite.GetResponseData(recorder, &plans)
	suite.Len(plans, 1, "Should return plan with ID 5")
	suite.Equal(int64(5), plans[0].ID, "Should return plan 5")
	suite.Equal(int64(2), plans[0].UserID, "Plan 5 belongs to user 2, not user 1")
}

// TestPlansResponseStructure tests the API response structure
func (suite *IntegrationTestSuite) TestPlansResponseStructure() {
	// Test that successful responses follow the expected structure
	recorder := suite.GET("/api/v1/plans?userId=1")
	suite.AssertStatusCode(recorder, 200)

	// Parse the raw response to check structure
	var response types.ApiSuccessResponse
	suite.AssertJSON(recorder, &response)
	suite.True(response.Success, "Response should indicate success")
	suite.NotNil(response.Data, "Response should contain data")

	// Test that error responses follow the expected structure
	recorder = suite.GET("/api/v1/plans")
	suite.AssertStatusCode(recorder, 400)

	var errorResponse types.ApiErrorResponse
	suite.AssertJSON(recorder, &errorResponse)
	suite.False(errorResponse.Success, "Error response should indicate failure")
	suite.NotEmpty(errorResponse.Error.Message, "Error response should contain message")
	suite.Equal("Bad Request", errorResponse.Error.Code, "Error code should be set")
}
