package integration

import (
	"backend/internal/api"
	"backend/tests/testdb"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/suite"
)

// IntegrationTestSuite provides the base test suite for integration tests
type IntegrationTestSuite struct {
	suite.Suite
	testDB *testdb.TestDatabase
	router http.Handler
	ctx    context.Context
}

// SetupSuite runs once before all tests in the suite
func (suite *IntegrationTestSuite) SetupSuite() {
	suite.ctx = context.Background()

	// Setup test database with container
	testDB, err := testdb.SetupTestDB(suite.ctx)
	suite.Require().NoError(err, "Failed to setup test database")
	suite.testDB = testDB

	// Seed test data
	err = suite.testDB.SeedTestData(suite.ctx)
	suite.Require().NoError(err, "Failed to seed test data")

	// Initialize router with test database
	suite.router = api.NewRouter(suite.testDB.DB)
}

// TearDownSuite runs once after all tests in the suite
func (suite *IntegrationTestSuite) TearDownSuite() {
	if suite.testDB != nil {
		err := suite.testDB.CleanupTestDB(suite.ctx)
		suite.Require().NoError(err, "Failed to cleanup test database")
	}
}

// SetupTest runs before each individual test
func (suite *IntegrationTestSuite) SetupTest() {
	// Reset and re-seed data to ensure clean state for each test
	err := suite.testDB.ResetAndSeed(suite.ctx)
	suite.Require().NoError(err, "Failed to reset and seed test data")
}

// HTTP Request Helpers

// GET performs a GET request and returns the response recorder
func (suite *IntegrationTestSuite) GET(path string) *httptest.ResponseRecorder {
	req := httptest.NewRequest("GET", path, nil)
	recorder := httptest.NewRecorder()
	suite.router.ServeHTTP(recorder, req)
	return recorder
}

// POST performs a POST request with JSON body and returns the response recorder
func (suite *IntegrationTestSuite) POST(path string, body interface{}) *httptest.ResponseRecorder {
	jsonBody, err := json.Marshal(body)
	suite.Require().NoError(err, "Failed to marshal request body")
	
	req := httptest.NewRequest("POST", path, bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	suite.router.ServeHTTP(recorder, req)
	return recorder
}

// PUT performs a PUT request with JSON body and returns the response recorder
func (suite *IntegrationTestSuite) PUT(path string, body interface{}) *httptest.ResponseRecorder {
	jsonBody, err := json.Marshal(body)
	suite.Require().NoError(err, "Failed to marshal request body")
	
	req := httptest.NewRequest("PUT", path, bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	suite.router.ServeHTTP(recorder, req)
	return recorder
}

// DELETE performs a DELETE request and returns the response recorder
func (suite *IntegrationTestSuite) DELETE(path string) *httptest.ResponseRecorder {
	req := httptest.NewRequest("DELETE", path, nil)
	recorder := httptest.NewRecorder()
	suite.router.ServeHTTP(recorder, req)
	return recorder
}

// Response Assertion Helpers

// AssertStatusCode verifies the HTTP status code
func (suite *IntegrationTestSuite) AssertStatusCode(recorder *httptest.ResponseRecorder, expectedCode int) {
	suite.Equal(expectedCode, recorder.Code, 
		fmt.Sprintf("Expected status %d, got %d. Response body: %s", 
			expectedCode, recorder.Code, recorder.Body.String()))
}

// AssertJSON unmarshals the response body into the provided interface
func (suite *IntegrationTestSuite) AssertJSON(recorder *httptest.ResponseRecorder, target interface{}) {
	err := json.Unmarshal(recorder.Body.Bytes(), target)
	suite.Require().NoError(err, 
		fmt.Sprintf("Failed to unmarshal response body: %s", recorder.Body.String()))
}

// AssertErrorResponse verifies that the response contains an error with the expected code
func (suite *IntegrationTestSuite) AssertErrorResponse(recorder *httptest.ResponseRecorder, expectedCode int, expectedMessage ...string) {
	suite.AssertStatusCode(recorder, expectedCode)
	
	if len(expectedMessage) > 0 {
		suite.Contains(recorder.Body.String(), expectedMessage[0],
			fmt.Sprintf("Expected error message to contain '%s', got: %s", 
				expectedMessage[0], recorder.Body.String()))
	}
}

// AssertSuccessResponse verifies that the response is successful (200-299)
func (suite *IntegrationTestSuite) AssertSuccessResponse(recorder *httptest.ResponseRecorder) {
	suite.True(recorder.Code >= 200 && recorder.Code < 300,
		fmt.Sprintf("Expected success status (200-299), got %d. Response body: %s",
			recorder.Code, recorder.Body.String()))
}

// GetResponseData extracts the 'data' field from a standardized API response
func (suite *IntegrationTestSuite) GetResponseData(recorder *httptest.ResponseRecorder, target interface{}) {
	var response struct {
		Data interface{} `json:"data"`
	}
	response.Data = target
	suite.AssertJSON(recorder, &response)
}

// TestSuiteSetup verifies the test suite setup works correctly
func (suite *IntegrationTestSuite) TestSuiteSetup() {
	// Test that database is healthy
	err := suite.testDB.Health(suite.ctx)
	suite.NoError(err, "Test database should be healthy")

	// Test that router responds with a simple endpoint that needs userId=1
	recorder := suite.GET("/api/v1/parameter-types?userId=1")
	suite.AssertSuccessResponse(recorder)
}

// Run the test suite
func TestIntegrationSuite(t *testing.T) {
	suite.Run(t, new(IntegrationTestSuite))
}