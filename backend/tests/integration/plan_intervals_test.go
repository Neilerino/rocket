package integration

import (
	"backend/internal/types"
)

// TestPlanIntervalsList tests the GET /api/v1/intervals endpoint with various filters
func (suite *IntegrationTestSuite) TestPlanIntervalsList() {
	// Test Case 1: planId=1 should return intervals for plan 1
	recorder := suite.GET("/api/v1/intervals?planId=1")
	suite.AssertStatusCode(recorder, 200)
	
	var intervals []types.PlanInterval
	suite.GetResponseData(recorder, &intervals)
	suite.Len(intervals, 2, "Plan 1 should have 2 intervals")
	
	// Verify all intervals belong to plan 1 and are ordered correctly
	for i, interval := range intervals {
		suite.Equal(int64(1), interval.PlanID, "All intervals should belong to plan 1")
		suite.Equal(int32(i+1), interval.Order, "Intervals should be ordered correctly")
	}
	
	// Verify specific interval names from seed data
	intervalNames := make(map[string]bool)
	for _, interval := range intervals {
		intervalNames[interval.Name] = true
	}
	suite.True(intervalNames["Week 1"], "Should contain Week 1 interval")
	suite.True(intervalNames["Week 2"], "Should contain Week 2 interval")

	// Test Case 2: id=1 should return specific interval
	recorder = suite.GET("/api/v1/intervals?id=1")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &intervals)
	suite.Len(intervals, 1, "Should return exactly one interval")
	suite.Equal(int64(1), intervals[0].ID, "Interval ID should be 1")
	suite.Equal("Week 1", intervals[0].Name, "Interval name should match seed data")
	suite.Equal("PT168H", intervals[0].Duration.String(), "Duration should be in ISO 8601 format (1 week = 168 hours)")

	// Test Case 3: planId=2 should return template plan intervals
	recorder = suite.GET("/api/v1/intervals?planId=2")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &intervals)
	suite.Len(intervals, 1, "Plan 2 should have 1 interval")
	suite.Equal("Template Week 1", intervals[0].Name, "Should be template interval")
	suite.Equal(int64(2), intervals[0].PlanID, "Should belong to plan 2")
}

// TestPlanIntervalsListUserIsolation tests user isolation through plan ownership
func (suite *IntegrationTestSuite) TestPlanIntervalsListUserIsolation() {
	// Test intervals for user 2's plan (plan 5)
	recorder := suite.GET("/api/v1/intervals?planId=5")
	suite.AssertStatusCode(recorder, 200)
	
	var intervals []types.PlanInterval
	suite.GetResponseData(recorder, &intervals)
	suite.Len(intervals, 1, "Plan 5 should have 1 interval")
	suite.Equal("User2 Week 1", intervals[0].Name, "Should be user 2's interval")
	suite.Equal(int64(5), intervals[0].PlanID, "Should belong to plan 5")
}

// TestPlanIntervalsListErrorCases tests error scenarios for the intervals list endpoint
func (suite *IntegrationTestSuite) TestPlanIntervalsListErrorCases() {
	// Test Case 1: No filters should return 400 error
	recorder := suite.GET("/api/v1/intervals")
	suite.AssertErrorResponse(recorder, 400, "Missing required field: planId or id")

	// Test Case 2: Non-existent planId should return 404 (based on handler logic)
	recorder = suite.GET("/api/v1/intervals?planId=999")
	suite.AssertErrorResponse(recorder, 404, "Plan interval not found")

	// Test Case 3: Non-existent interval ID should return 404
	recorder = suite.GET("/api/v1/intervals?id=999")
	suite.AssertErrorResponse(recorder, 404, "Plan interval not found")
}

// TestPlanIntervalsCreate tests the POST /api/v1/intervals endpoint
func (suite *IntegrationTestSuite) TestPlanIntervalsCreate() {
	// Valid interval creation
	createRequest := map[string]interface{}{
		"planId":      1,
		"name":        "Week 3",
		"description": "Third week of the plan",
		"duration":    "1 week",
		"order":       3,
	}
	
	recorder := suite.POST("/api/v1/intervals", createRequest)
	suite.AssertStatusCode(recorder, 200)
	
	var createdInterval types.PlanInterval
	suite.GetResponseData(recorder, &createdInterval)
	suite.Equal("Week 3", createdInterval.Name, "Created interval name should match")
	suite.Equal("Third week of the plan", createdInterval.Description, "Created interval description should match")
	suite.Equal(int64(1), createdInterval.PlanID, "Created interval should belong to plan 1")
	suite.Equal("PT168H", createdInterval.Duration.String(), "Duration should be in ISO 8601 format (1 week = PT168H)")
	suite.Equal(int32(3), createdInterval.Order, "Order should match")
	suite.NotZero(createdInterval.ID, "Created interval should have an ID")

	// Verify interval was created by listing intervals for plan 1
	recorder = suite.GET("/api/v1/intervals?planId=1")
	suite.AssertStatusCode(recorder, 200)
	
	var intervals []types.PlanInterval
	suite.GetResponseData(recorder, &intervals)
	suite.Len(intervals, 3, "Plan 1 should now have 3 intervals") // 2 original + 1 new
}

// TestPlanIntervalsCreateErrorCases tests error scenarios for interval creation
func (suite *IntegrationTestSuite) TestPlanIntervalsCreateErrorCases() {
	// Test Case 1: Missing planId should return 400
	createRequest := map[string]interface{}{
		"name":        "Invalid Interval",
		"description": "Missing planId",
		"duration":    "1 week",
		"order":       1,
	}
	
	recorder := suite.POST("/api/v1/intervals", createRequest)
	suite.AssertErrorResponse(recorder, 400, "Missing required field: planId")

	// Test Case 2: Missing name should return 400
	createRequest = map[string]interface{}{
		"planId":      1,
		"description": "Missing name",
		"duration":    "1 week",
		"order":       1,
	}
	
	recorder = suite.POST("/api/v1/intervals", createRequest)
	suite.AssertErrorResponse(recorder, 400, "Missing required field: name")

	// Test Case 3: Missing duration should return 400
	createRequest = map[string]interface{}{
		"planId":      1,
		"name":        "No Duration",
		"description": "Missing duration",
		"order":       1,
	}
	
	recorder = suite.POST("/api/v1/intervals", createRequest)
	suite.AssertErrorResponse(recorder, 400, "Missing required field: duration")

	// Test Case 4: Invalid JSON should return 400
	recorder = suite.POST("/api/v1/intervals", "invalid json")
	suite.AssertErrorResponse(recorder, 400, "Invalid request body")

	// Test Case 5: Non-existent planId should return error
	createRequest = map[string]interface{}{
		"planId":      999,
		"name":        "Orphan Interval",
		"description": "Plan doesn't exist",
		"duration":    "1 week",
		"order":       1,
	}
	
	recorder = suite.POST("/api/v1/intervals", createRequest)
	// Should return error when trying to create interval for non-existent plan
	suite.True(recorder.Code >= 400, "Should return error for non-existent plan")
}

// TestPlanIntervalsUpdate tests the PUT /api/v1/intervals/{id} endpoint
func (suite *IntegrationTestSuite) TestPlanIntervalsUpdate() {
	// Note: Based on the handler code, Update returns 501 Not Implemented
	updateRequest := map[string]interface{}{
		"name":        "Updated Week 1",
		"description": "Updated description",
		"duration":    "10 days",
		"order":       1,
	}
	
	recorder := suite.PUT("/api/v1/intervals/1", updateRequest)
	suite.AssertErrorResponse(recorder, 501, "Update operation not yet implemented")
}

// TestPlanIntervalsUpdateErrorCases tests error scenarios for interval updates
func (suite *IntegrationTestSuite) TestPlanIntervalsUpdateErrorCases() {
	updateRequest := map[string]interface{}{
		"name": "Valid Name",
	}

	// Test Case 1: Invalid ID format returns 400
	recorder := suite.PUT("/api/v1/intervals/invalid", updateRequest)
	suite.AssertErrorResponse(recorder, 400, "Invalid interval ID")

	// Test Case 2: Any valid ID returns 501 (not implemented)
	recorder = suite.PUT("/api/v1/intervals/999", updateRequest)
	suite.AssertErrorResponse(recorder, 501, "Update operation not yet implemented")
}

// TestPlanIntervalsDelete tests the DELETE /api/v1/intervals/{id} endpoint
func (suite *IntegrationTestSuite) TestPlanIntervalsDelete() {
	// Valid interval deletion
	recorder := suite.DELETE("/api/v1/intervals/1")
	suite.AssertStatusCode(recorder, 200) // Note: Handler returns 200, not 204

	// Verify interval is deleted by trying to get it
	recorder = suite.GET("/api/v1/intervals?id=1")
	suite.AssertErrorResponse(recorder, 404, "Plan interval not found")

	// Verify plan's interval count decreased
	recorder = suite.GET("/api/v1/intervals?planId=1")
	// Should now have 1 interval instead of 2
	if recorder.Code == 200 {
		var intervals []types.PlanInterval
		suite.GetResponseData(recorder, &intervals)
		suite.Len(intervals, 1, "Plan 1 should now have 1 interval") // 2 original - 1 deleted
	} else {
		// If no intervals remain, should return 404
		suite.AssertErrorResponse(recorder, 404)
	}
}

// TestPlanIntervalsDeleteErrorCases tests error scenarios for interval deletion
func (suite *IntegrationTestSuite) TestPlanIntervalsDeleteErrorCases() {
	// Test Case 1: Delete non-existent interval should return error
	recorder := suite.DELETE("/api/v1/intervals/999")
	// Should return error when trying to delete non-existent interval
	suite.True(recorder.Code >= 400, "Should return error for non-existent interval")

	// Test Case 2: Invalid ID format returns 400
	recorder = suite.DELETE("/api/v1/intervals/invalid")
	suite.AssertErrorResponse(recorder, 400, "Invalid plan interval ID")
}

// TestPlanIntervalsPagination tests pagination for intervals list
func (suite *IntegrationTestSuite) TestPlanIntervalsPagination() {
	// Test limit parameter
	recorder := suite.GET("/api/v1/intervals?planId=1&limit=1")
	suite.AssertStatusCode(recorder, 200)
	
	var intervals []types.PlanInterval
	suite.GetResponseData(recorder, &intervals)
	suite.LessOrEqual(len(intervals), 1, "Should respect limit parameter")
	
	if len(intervals) > 0 {
		suite.Equal(int64(1), intervals[0].PlanID, "Interval should belong to plan 1")
	}
}

// TestPlanIntervalsResponseStructure tests the API response structure
func (suite *IntegrationTestSuite) TestPlanIntervalsResponseStructure() {
	// Test that successful responses follow the expected structure
	recorder := suite.GET("/api/v1/intervals?planId=1")
	suite.AssertStatusCode(recorder, 200)
	
	// Parse the raw response to check structure
	var response types.ApiSuccessResponse
	suite.AssertJSON(recorder, &response)
	suite.True(response.Success, "Response should indicate success")
	suite.NotNil(response.Data, "Response should contain data")
	
	// Test that error responses follow the expected structure
	recorder = suite.GET("/api/v1/intervals")
	suite.AssertStatusCode(recorder, 400)
	
	var errorResponse types.ApiErrorResponse
	suite.AssertJSON(recorder, &errorResponse)
	suite.False(errorResponse.Success, "Error response should indicate failure")
	suite.NotEmpty(errorResponse.Error.Message, "Error response should contain message")
	suite.Equal("Bad Request", errorResponse.Error.Code, "Error code should be set")
}

// TestPlanIntervalsFieldValidation tests the field validation and structure
func (suite *IntegrationTestSuite) TestPlanIntervalsFieldValidation() {
	// Get an interval and verify all expected fields are present
	recorder := suite.GET("/api/v1/intervals?planId=1&limit=1")
	suite.AssertStatusCode(recorder, 200)
	
	var intervals []types.PlanInterval
	suite.GetResponseData(recorder, &intervals)
	suite.Len(intervals, 1, "Should return one interval")
	
	interval := intervals[0]
	suite.NotZero(interval.ID, "Interval should have an ID")
	suite.NotEmpty(interval.Name, "Interval should have a name")
	suite.NotEmpty(interval.Duration, "Interval should have a duration")
	suite.Equal(int64(1), interval.PlanID, "Interval should belong to plan 1")
	suite.NotZero(interval.Order, "Interval should have an order")
	suite.NotEmpty(interval.CreatedAt, "Interval should have created timestamp")
	suite.NotEmpty(interval.UpdatedAt, "Interval should have updated timestamp")
	// Description can be empty, GroupCount is optional
}

// TestPlanIntervalsSpecificValues tests specific intervals from our seed data
func (suite *IntegrationTestSuite) TestPlanIntervalsSpecificValues() {
	// Test getting specific interval (ID=1 from seed data)
	recorder := suite.GET("/api/v1/intervals?id=1")
	suite.AssertStatusCode(recorder, 200)
	
	var intervals []types.PlanInterval
	suite.GetResponseData(recorder, &intervals)
	suite.Len(intervals, 1, "Should return one interval")
	
	interval := intervals[0]
	suite.Equal(int64(1), interval.ID, "Should be interval 1")
	suite.Equal("Week 1", interval.Name, "Should be Week 1")
	suite.Equal("First week of regular plan", interval.Description, "Description should match seed data")
	suite.Equal(int64(1), interval.PlanID, "Should belong to plan 1")
	suite.Equal("PT168H", interval.Duration.String(), "Duration should be 1 week in ISO 8601 format (PT168H)")
	suite.Equal(int32(1), interval.Order, "Should be first in order")

	// Test getting template interval (ID=3 from seed data)
	recorder = suite.GET("/api/v1/intervals?id=3")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &intervals)
	suite.Len(intervals, 1, "Should return one interval")
	
	templateInterval := intervals[0]
	suite.Equal(int64(3), templateInterval.ID, "Should be interval 3")
	suite.Equal("Template Week 1", templateInterval.Name, "Should be template interval")
	suite.Equal(int64(2), templateInterval.PlanID, "Should belong to template plan 2")
}

// TestPlanIntervalsOrdering tests that intervals are returned in correct order
func (suite *IntegrationTestSuite) TestPlanIntervalsOrdering() {
	// Get all intervals for plan 1
	recorder := suite.GET("/api/v1/intervals?planId=1")
	suite.AssertStatusCode(recorder, 200)
	
	var intervals []types.PlanInterval
	suite.GetResponseData(recorder, &intervals)
	suite.Len(intervals, 2, "Plan 1 should have 2 intervals")
	
	// Verify intervals are ordered correctly
	if len(intervals) >= 2 {
		// Should be ordered by the "order" field
		suite.LessOrEqual(intervals[0].Order, intervals[1].Order, "Intervals should be ordered")
		
		// First interval should be "Week 1", second should be "Week 2"
		if intervals[0].Order == 1 {
			suite.Equal("Week 1", intervals[0].Name, "First interval should be Week 1")
		}
		if len(intervals) > 1 && intervals[1].Order == 2 {
			suite.Equal("Week 2", intervals[1].Name, "Second interval should be Week 2")
		}
	}
}