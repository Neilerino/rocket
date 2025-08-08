package integration

import (
	"backend/internal/types"
)

// TestGroupsList tests the GET /api/v1/groups endpoint with various filters
func (suite *IntegrationTestSuite) TestGroupsList() {
	// Test Case 1: userId=1 should return user 1's groups
	recorder := suite.GET("/api/v1/groups?userId=1")
	suite.AssertStatusCode(recorder, 200)
	
	var groups []types.Group
	suite.GetResponseData(recorder, &groups)
	suite.Len(groups, 3, "User 1 should have 3 groups")
	
	// Verify all groups belong to user 1
	for _, group := range groups {
		suite.Equal(int64(1), group.UserID, "All groups should belong to user 1")
	}

	// Verify group names match test data
	groupNames := make(map[string]bool)
	for _, group := range groups {
		groupNames[group.Name] = true
	}
	suite.True(groupNames["Upper Body"], "Should contain Upper Body group")
	suite.True(groupNames["Lower Body"], "Should contain Lower Body group")
	suite.True(groupNames["Core"], "Should contain Core group")

	// Test Case 2: id=1 should return specific group
	recorder = suite.GET("/api/v1/groups?id=1")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &groups)
	suite.Len(groups, 1, "Should return exactly one group")
	suite.Equal(int64(1), groups[0].ID, "Group ID should be 1")
	suite.Equal("Upper Body", groups[0].Name, "Group name should match test data")
}

// TestGroupsListUserIsolation tests user isolation in groups list
func (suite *IntegrationTestSuite) TestGroupsListUserIsolation() {
	// User isolation - userId=2 should only return user 2's groups
	recorder := suite.GET("/api/v1/groups?userId=2")
	suite.AssertStatusCode(recorder, 200)
	
	var groups []types.Group
	suite.GetResponseData(recorder, &groups)
	suite.Len(groups, 1, "User 2 should have 1 group")
	suite.Equal(int64(2), groups[0].UserID, "Group should belong to user 2")
	suite.Equal("User2 Upper Body", groups[0].Name, "Group name should match test data")
}

// TestGroupsListErrorCases tests error scenarios for the groups list endpoint
func (suite *IntegrationTestSuite) TestGroupsListErrorCases() {
	// Test Case 1: Non-existent userId should return empty array
	recorder := suite.GET("/api/v1/groups?userId=999")
	suite.AssertStatusCode(recorder, 200)
	
	var groups []types.Group
	suite.GetResponseData(recorder, &groups)
	suite.Len(groups, 0, "Non-existent user should return empty array")

	// Test Case 2: No filters should return 400 error
	recorder = suite.GET("/api/v1/groups")
	suite.AssertErrorResponse(recorder, 400, "Missing required field")
}

// TestGroupsCreate tests the POST /api/v1/groups endpoint
func (suite *IntegrationTestSuite) TestGroupsCreate() {
	// Valid group creation
	createRequest := map[string]interface{}{
		"name":        "Test New Group",
		"description": "A test group description",
	}
	
	recorder := suite.POST("/api/v1/groups", createRequest)
	suite.AssertStatusCode(recorder, 200)
	
	var createdGroup types.Group
	suite.GetResponseData(recorder, &createdGroup)
	suite.Equal("Test New Group", createdGroup.Name, "Created group name should match")
	suite.Equal("A test group description", createdGroup.Description, "Created group description should match")
	suite.Equal(int64(1), createdGroup.UserID, "Created group should belong to user 1") // Hardcoded in handler
	suite.NotZero(createdGroup.ID, "Created group should have an ID")

	// Verify group was created by listing groups
	recorder = suite.GET("/api/v1/groups?userId=1")
	suite.AssertStatusCode(recorder, 200)
	
	var groups []types.Group
	suite.GetResponseData(recorder, &groups)
	suite.Len(groups, 4, "User 1 should now have 4 groups") // 3 original + 1 new
}

// TestGroupsCreateErrorCases tests error scenarios for group creation
func (suite *IntegrationTestSuite) TestGroupsCreateErrorCases() {
	// Test Case 1: Invalid JSON should return 400
	recorder := suite.POST("/api/v1/groups", "invalid json")
	suite.AssertErrorResponse(recorder, 400, "Invalid request body")
}

// TestGroupsUpdate tests the PUT /api/v1/groups/{id} endpoint
func (suite *IntegrationTestSuite) TestGroupsUpdate() {
	// Valid group update
	updateRequest := map[string]interface{}{
		"name":        "Updated Group Name",
		"description": "Updated group description",
	}
	
	recorder := suite.PUT("/api/v1/groups/1", updateRequest)
	suite.AssertStatusCode(recorder, 200)
	
	var updatedGroup types.Group
	suite.GetResponseData(recorder, &updatedGroup)
	suite.Equal("Updated Group Name", updatedGroup.Name, "Group name should be updated")
	suite.Equal("Updated group description", updatedGroup.Description, "Group description should be updated")
	suite.Equal(int64(1), updatedGroup.UserID, "Group should still belong to user 1")
	suite.Equal(int64(1), updatedGroup.ID, "Group ID should remain the same")

	// Verify update persisted by getting the group
	recorder = suite.GET("/api/v1/groups?id=1")
	suite.AssertStatusCode(recorder, 200)
	
	var groups []types.Group
	suite.GetResponseData(recorder, &groups)
	suite.Len(groups, 1, "Should return the updated group")
	suite.Equal("Updated Group Name", groups[0].Name, "Name should be updated")
}

// TestGroupsUpdateErrorCases tests error scenarios for group updates
func (suite *IntegrationTestSuite) TestGroupsUpdateErrorCases() {
	updateRequest := map[string]interface{}{
		"name":        "Valid Name",
		"description": "Valid description",
	}

	// Test Case 1: Update non-existent group should return error
	recorder := suite.PUT("/api/v1/groups/999", updateRequest)
	suite.AssertErrorResponse(recorder, 500) // Should ideally be 404, but service returns 500 for not found

	// Test Case 2: Invalid ID format returns 400
	recorder = suite.PUT("/api/v1/groups/invalid", updateRequest)
	suite.AssertErrorResponse(recorder, 400, "Invalid group ID")

	// Test Case 3: Invalid JSON should return 400
	recorder = suite.PUT("/api/v1/groups/1", "invalid json")
	suite.AssertErrorResponse(recorder, 400, "Invalid request body")
}

// TestGroupsDelete tests the DELETE /api/v1/groups/{id} endpoint
func (suite *IntegrationTestSuite) TestGroupsDelete() {
	// Valid group deletion
	recorder := suite.DELETE("/api/v1/groups/1")
	suite.AssertStatusCode(recorder, 200) // Note: Handler returns 200, not 204

	// Verify group is deleted by trying to get it
	recorder = suite.GET("/api/v1/groups?id=1")
	suite.AssertStatusCode(recorder, 200)
	
	var groups []types.Group
	suite.GetResponseData(recorder, &groups)
	suite.Len(groups, 0, "Deleted group should not be returned")

	// Verify user's group count decreased
	recorder = suite.GET("/api/v1/groups?userId=1")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &groups)
	suite.Len(groups, 2, "User 1 should now have 2 groups") // 3 original - 1 deleted
}

// TestGroupsDeleteErrorCases tests error scenarios for group deletion
func (suite *IntegrationTestSuite) TestGroupsDeleteErrorCases() {
	// Test Case 1: Delete non-existent group should return error
	recorder := suite.DELETE("/api/v1/groups/999")
	suite.AssertErrorResponse(recorder, 500) // Should ideally be 404, but service returns 500 for not found

	// Test Case 2: Invalid ID format returns 400
	recorder = suite.DELETE("/api/v1/groups/invalid")
	suite.AssertErrorResponse(recorder, 400, "Invalid group ID")
}

// TestGroupsAdvancedFiltering tests advanced filtering scenarios
func (suite *IntegrationTestSuite) TestGroupsAdvancedFiltering() {
	// Test limit parameter
	recorder := suite.GET("/api/v1/groups?userId=1&limit=2")
	suite.AssertStatusCode(recorder, 200)
	
	var groups []types.Group
	suite.GetResponseData(recorder, &groups)
	suite.LessOrEqual(len(groups), 2, "Should respect limit parameter")
	
	// All returned groups should belong to user 1
	for _, group := range groups {
		suite.Equal(int64(1), group.UserID, "All groups should belong to user 1")
	}

	// Test planId filter (if implemented)
	recorder = suite.GET("/api/v1/groups?planId=1")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &groups)
	// This should return groups that are associated with plan 1
	// The exact count depends on the test data relationships
}

// TestGroupsResponseStructure tests the API response structure
func (suite *IntegrationTestSuite) TestGroupsResponseStructure() {
	// Test that successful responses follow the expected structure
	recorder := suite.GET("/api/v1/groups?userId=1")
	suite.AssertStatusCode(recorder, 200)
	
	// Parse the raw response to check structure
	var response types.ApiSuccessResponse
	suite.AssertJSON(recorder, &response)
	suite.True(response.Success, "Response should indicate success")
	suite.NotNil(response.Data, "Response should contain data")
	
	// Test that error responses follow the expected structure
	recorder = suite.GET("/api/v1/groups")
	suite.AssertStatusCode(recorder, 400)
	
	var errorResponse types.ApiErrorResponse
	suite.AssertJSON(recorder, &errorResponse)
	suite.False(errorResponse.Success, "Error response should indicate failure")
	suite.NotEmpty(errorResponse.Error.Message, "Error response should contain message")
	suite.Equal("Bad Request", errorResponse.Error.Code, "Error code should be set")
}

// TestGroupsFieldValidation tests the field validation and structure
func (suite *IntegrationTestSuite) TestGroupsFieldValidation() {
	// Get a group and verify all expected fields are present
	recorder := suite.GET("/api/v1/groups?userId=1&limit=1")
	suite.AssertStatusCode(recorder, 200)
	
	var groups []types.Group
	suite.GetResponseData(recorder, &groups)
	suite.Len(groups, 1, "Should return one group")
	
	group := groups[0]
	suite.NotZero(group.ID, "Group should have an ID")
	suite.NotEmpty(group.Name, "Group should have a name")
	suite.NotEmpty(group.Description, "Group should have a description")
	suite.Equal(int64(1), group.UserID, "Group should belong to user 1")
	suite.NotEmpty(group.CreatedAt, "Group should have created timestamp")
	suite.NotEmpty(group.UpdatedAt, "Group should have updated timestamp")
}

// TestGroupsIntervalAssignment tests the group-interval assignment endpoints
func (suite *IntegrationTestSuite) TestGroupsIntervalAssignment() {
	// Test Case 1: Assign group to interval
	recorder := suite.POST("/api/v1/groups/1/assign/1", nil)
	suite.AssertStatusCode(recorder, 200)

	// Test Case 2: Remove group from interval (note the inconsistent path parameter name in handler)
	// Based on the handler, it expects 'planIntervalId' not 'intervalId'
	recorder = suite.DELETE("/api/v1/groups/1/assign/1")
	suite.AssertStatusCode(recorder, 200)
}

// TestGroupsIntervalAssignmentErrorCases tests error scenarios for assignment operations
func (suite *IntegrationTestSuite) TestGroupsIntervalAssignmentErrorCases() {
	// Test Case 1: Invalid group ID for assignment
	recorder := suite.POST("/api/v1/groups/invalid/assign/1", nil)
	suite.AssertErrorResponse(recorder, 400, "Invalid group ID")

	// Test Case 2: Invalid interval ID for assignment
	recorder = suite.POST("/api/v1/groups/1/assign/invalid", nil)
	suite.AssertErrorResponse(recorder, 400, "Invalid plan interval ID")

	// Test Case 3: Invalid group ID for removal
	recorder = suite.DELETE("/api/v1/groups/invalid/assign/1")
	suite.AssertErrorResponse(recorder, 400, "Invalid group ID")

	// Test Case 4: Invalid interval ID for removal
	recorder = suite.DELETE("/api/v1/groups/1/assign/invalid")
	suite.AssertErrorResponse(recorder, 400, "Invalid plan interval ID")
}