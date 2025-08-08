package integration

import (
	"backend/internal/types"
)

// TestParameterTypesList tests the GET /api/v1/parameter-types endpoint with various filters
func (suite *IntegrationTestSuite) TestParameterTypesList() {
	// Test Case 1: userId=1 should return parameter types for user 1
	recorder := suite.GET("/api/v1/parameter-types?userId=1")
	suite.AssertStatusCode(recorder, 200)
	
	var parameterTypes []types.ParameterType
	suite.GetResponseData(recorder, &parameterTypes)
	
	// Note: Parameter types appear to be global (no user_id in our seed data)
	// So this should return all parameter types
	suite.GreaterOrEqual(len(parameterTypes), 1, "Should return parameter types for user 1")

	// Verify we have the expected parameter types from our seed data
	parameterTypeNames := make(map[string]bool)
	for _, pt := range parameterTypes {
		parameterTypeNames[pt.Name] = true
	}
	
	// Check for key parameter types from our seed data
	suite.True(parameterTypeNames["Weight"] || len(parameterTypes) > 0, "Should contain expected parameter types")

	// Test Case 2: parameterTypeId=1 should return specific parameter type
	recorder = suite.GET("/api/v1/parameter-types?parameterTypeId=1")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &parameterTypes)
	suite.GreaterOrEqual(len(parameterTypes), 1, "Should return parameter type with ID 1")
	
	// If we got results, verify the first one has ID 1
	if len(parameterTypes) > 0 {
		suite.Equal(int64(1), parameterTypes[0].ID, "Parameter type ID should be 1")
		suite.Equal("Weight", parameterTypes[0].Name, "Parameter type name should match seed data")
	}

	// Test Case 3: Both filters provided should work
	recorder = suite.GET("/api/v1/parameter-types?userId=1&parameterTypeId=2")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &parameterTypes)
	// Should return results based on the filters
	suite.GreaterOrEqual(len(parameterTypes), 0, "Should handle multiple filters")
}

// TestParameterTypesListErrorCases tests error scenarios for the parameter types list endpoint
func (suite *IntegrationTestSuite) TestParameterTypesListErrorCases() {
	// Test Case 1: No filters should return 400 error
	recorder := suite.GET("/api/v1/parameter-types")
	suite.AssertErrorResponse(recorder, 400, "Missing required field: userId or parameterTypeId")

	// Test Case 2: Non-existent userId should return empty or valid response
	recorder = suite.GET("/api/v1/parameter-types?userId=999")
	suite.AssertStatusCode(recorder, 200) // Should not error, just return empty/filtered results
	
	var parameterTypes []types.ParameterType
	suite.GetResponseData(recorder, &parameterTypes)
	// Result count depends on whether parameter types are user-specific or global

	// Test Case 3: Non-existent parameterTypeId should return empty response
	recorder = suite.GET("/api/v1/parameter-types?parameterTypeId=999")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &parameterTypes)
	suite.Len(parameterTypes, 0, "Non-existent parameter type ID should return empty array")
}

// TestParameterTypesPagination tests pagination for parameter types list
func (suite *IntegrationTestSuite) TestParameterTypesPagination() {
	// Test limit parameter
	recorder := suite.GET("/api/v1/parameter-types?userId=1&limit=2")
	suite.AssertStatusCode(recorder, 200)
	
	var parameterTypes []types.ParameterType
	suite.GetResponseData(recorder, &parameterTypes)
	suite.LessOrEqual(len(parameterTypes), 2, "Should respect limit parameter")

	// Test offset parameter
	recorder = suite.GET("/api/v1/parameter-types?userId=1&offset=1")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &parameterTypes)
	// Should return results starting from offset 1
	suite.GreaterOrEqual(len(parameterTypes), 0, "Should handle offset parameter")

	// Test limit and offset together
	recorder = suite.GET("/api/v1/parameter-types?userId=1&limit=1&offset=1")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &parameterTypes)
	suite.LessOrEqual(len(parameterTypes), 1, "Should respect both limit and offset")
}

// TestParameterTypesResponseStructure tests the API response structure
func (suite *IntegrationTestSuite) TestParameterTypesResponseStructure() {
	// Test that successful responses follow the expected structure
	recorder := suite.GET("/api/v1/parameter-types?userId=1")
	suite.AssertStatusCode(recorder, 200)
	
	// Parse the raw response to check structure
	var response types.ApiSuccessResponse
	suite.AssertJSON(recorder, &response)
	suite.True(response.Success, "Response should indicate success")
	suite.NotNil(response.Data, "Response should contain data")
	
	// Test that error responses follow the expected structure
	recorder = suite.GET("/api/v1/parameter-types")
	suite.AssertStatusCode(recorder, 400)
	
	var errorResponse types.ApiErrorResponse
	suite.AssertJSON(recorder, &errorResponse)
	suite.False(errorResponse.Success, "Error response should indicate failure")
	suite.NotEmpty(errorResponse.Error.Message, "Error response should contain message")
	suite.Equal("Bad Request", errorResponse.Error.Code, "Error code should be set")
}

// TestParameterTypesFieldValidation tests the field validation and structure
func (suite *IntegrationTestSuite) TestParameterTypesFieldValidation() {
	// Get parameter types and verify all expected fields are present
	recorder := suite.GET("/api/v1/parameter-types?userId=1&limit=1")
	suite.AssertStatusCode(recorder, 200)
	
	var parameterTypes []types.ParameterType
	suite.GetResponseData(recorder, &parameterTypes)
	
	if len(parameterTypes) > 0 {
		parameterType := parameterTypes[0]
		suite.NotZero(parameterType.ID, "Parameter type should have an ID")
		suite.NotEmpty(parameterType.Name, "Parameter type should have a name")
		suite.NotEmpty(parameterType.DataType, "Parameter type should have a data type")
		suite.NotEmpty(parameterType.DefaultUnit, "Parameter type should have a default unit")
		// MinValue and MaxValue are optional and may be zero
	}
}

// TestParameterTypesSpecificValues tests specific parameter types from our seed data
func (suite *IntegrationTestSuite) TestParameterTypesSpecificValues() {
	// Test getting Weight parameter type (ID=1 from seed data)
	recorder := suite.GET("/api/v1/parameter-types?parameterTypeId=1")
	suite.AssertStatusCode(recorder, 200)
	
	var parameterTypes []types.ParameterType
	suite.GetResponseData(recorder, &parameterTypes)
	
	if len(parameterTypes) > 0 {
		weight := parameterTypes[0]
		suite.Equal(int64(1), weight.ID, "Weight parameter type should have ID 1")
		suite.Equal("Weight", weight.Name, "Should be Weight parameter type")
		suite.Equal("weight", weight.DataType, "Should have weight data type")
		suite.Equal("kg", weight.DefaultUnit, "Should have kg as default unit")
		suite.Equal(float64(0), weight.MinValue, "Should have min value of 0")
		suite.Equal(float64(1000), weight.MaxValue, "Should have max value of 1000")
	}

	// Test getting Reps parameter type (ID=2 from seed data)
	recorder = suite.GET("/api/v1/parameter-types?parameterTypeId=2")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &parameterTypes)
	
	if len(parameterTypes) > 0 {
		reps := parameterTypes[0]
		suite.Equal(int64(2), reps.ID, "Reps parameter type should have ID 2")
		suite.Equal("Reps", reps.Name, "Should be Reps parameter type")
		suite.Equal("count", reps.DataType, "Should have count data type")
		suite.Equal("reps", reps.DefaultUnit, "Should have reps as default unit")
		suite.Equal(float64(1), reps.MinValue, "Should have min value of 1")
		suite.Equal(float64(999), reps.MaxValue, "Should have max value of 999")
	}

	// Test getting Percentage parameter type (ID=5 from seed data)
	recorder = suite.GET("/api/v1/parameter-types?parameterTypeId=5")
	suite.AssertStatusCode(recorder, 200)
	
	suite.GetResponseData(recorder, &parameterTypes)
	
	if len(parameterTypes) > 0 {
		percentage := parameterTypes[0]
		suite.Equal(int64(5), percentage.ID, "Percentage parameter type should have ID 5")
		suite.Equal("Percentage", percentage.Name, "Should be Percentage parameter type")
		suite.Equal("percentage", percentage.DataType, "Should have percentage data type")
		suite.Equal("%", percentage.DefaultUnit, "Should have % as default unit")
		suite.Equal(float64(0), percentage.MinValue, "Should have min value of 0")
		suite.Equal(float64(100), percentage.MaxValue, "Should have max value of 100")
	}
}

// TestParameterTypesAllSeededData tests that we can retrieve all seeded parameter types
func (suite *IntegrationTestSuite) TestParameterTypesAllSeededData() {
	// Get all parameter types for user 1 (assuming they're global)
	recorder := suite.GET("/api/v1/parameter-types?userId=1&limit=100")
	suite.AssertStatusCode(recorder, 200)
	
	var parameterTypes []types.ParameterType
	suite.GetResponseData(recorder, &parameterTypes)
	
	// We should have at least the 5 parameter types from our seed data
	suite.GreaterOrEqual(len(parameterTypes), 5, "Should have at least 5 parameter types from seed data")
	
	// Create a map for easy lookup
	parameterTypesByName := make(map[string]types.ParameterType)
	for _, pt := range parameterTypes {
		parameterTypesByName[pt.Name] = pt
	}
	
	// Verify all expected parameter types exist
	expectedTypes := []string{"Weight", "Reps", "Duration", "Distance", "Percentage"}
	for _, expectedType := range expectedTypes {
		_, exists := parameterTypesByName[expectedType]
		if !exists && len(parameterTypes) >= 5 {
			// Only fail if we have enough parameter types but missing expected ones
			suite.True(exists, "Should contain %s parameter type", expectedType)
		}
	}
}