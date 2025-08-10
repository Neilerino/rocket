package tests

import (
	"backend/db"
	"backend/internal/api/middleware"
	"backend/internal/types"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// ApiResponse matches the frontend ApiResponse interface
type ApiResponse struct {
	Success bool            `json:"success"`
	Data    json.RawMessage `json:"data,omitempty"`
	Error   *struct {
		Code    string `json:"code,omitempty"`
		Message string `json:"message"`
		Details string `json:"details,omitempty"`
	} `json:"error,omitempty"`
	Meta map[string]any `json:"meta,omitempty"`
}

// TestPlansListWithMiddleware tests that the plans list handler works with the response middleware
func TestPlansListWithMiddleware(t *testing.T) {
	// Create mock plans data
	mockPlans := []db.Plan{
		{
			ID:          1,
			Name:        "Test Plan 1",
			Description: "Test Description 1",
			UserID:      1,
			IsTemplate:  true,
			IsPublic:    false,
		},
		{
			ID:          2,
			Name:        "Test Plan 2",
			Description: "Test Description 2",
			UserID:      1,
			IsTemplate:  false,
			IsPublic:    true,
		},
	}

	// Create a mock repository and service
	mockRepo := &MockPlansRepository{plans: mockPlans}
	mockService := &MockPlansService{repo: mockRepo}

	// Create a router with our middleware
	r := chi.NewRouter()

	// Add the response middleware
	r.Use(middleware.ResponseMiddleware)

	// Create a test plans handler that uses our mock service
	planHandler := &TestPlanHandler{
		mockService: mockService,
	}

	// Add the handler route
	r.Get("/api/v1/plans", planHandler.List)

	// Create a test request
	req, err := http.NewRequest("GET", "/api/v1/plans?userId=1", nil)
	require.NoError(t, err)

	// Create a response recorder
	rr := httptest.NewRecorder()

	// Serve the request
	r.ServeHTTP(rr, req)

	// Check the status code
	assert.Equal(t, http.StatusOK, rr.Code)

	// Parse the response
	var response ApiResponse
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	require.NoError(t, err)

	// Verify the response structure
	assert.True(t, response.Success)
	assert.Nil(t, response.Error)

	// Parse the data into our expected format
	var plans []types.Plan
	err = json.Unmarshal(response.Data, &plans)
	require.NoError(t, err)

	// Verify the data content
	assert.Len(t, plans, 2)
	assert.Equal(t, int64(1), plans[0].ID)
	assert.Equal(t, "Test Plan 1", plans[0].Name)
	assert.Equal(t, int64(2), plans[1].ID)
	assert.Equal(t, "Test Plan 2", plans[1].Name)

	// Test with filters
	// Create a request with isTemplate=true filter
	req, err = http.NewRequest("GET", "/api/v1/plans?userId=1&isTemplate=true", nil)
	require.NoError(t, err)

	rr = httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	// Check the status code
	assert.Equal(t, http.StatusOK, rr.Code)

	// Parse the response
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	require.NoError(t, err)

	// Verify the response structure
	assert.True(t, response.Success)

	// Parse the data into our expected format for filtered results
	var filteredPlans []types.Plan
	err = json.Unmarshal(response.Data, &filteredPlans)
	require.NoError(t, err)

	// Verify filtering worked correctly
	assert.Len(t, filteredPlans, 1)
	assert.Equal(t, int64(1), filteredPlans[0].ID) // Only the template plan should be returned
	assert.Equal(t, "Test Plan 1", filteredPlans[0].Name)

	// Test error case - missing userId
	req, err = http.NewRequest("GET", "/api/v1/plans", nil)
	require.NoError(t, err)

	rr = httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	// Check the status code - should still be 400
	assert.Equal(t, http.StatusBadRequest, rr.Code)

	// Parse the response
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	require.NoError(t, err)

	// Verify error response structure
	assert.False(t, response.Success)
	assert.NotNil(t, response.Error)
	assert.Equal(t, "Bad Request", response.Error.Code)
	assert.Equal(t, "Missing required field: userId", response.Error.Message)
}

// TestPlanHandler is a test handler that uses our mock service
type TestPlanHandler struct {
	mockService *MockPlansService
}

// List handles GET /plans requests
func (h *TestPlanHandler) List(w http.ResponseWriter, r *http.Request) {
	// Get the userId from the request
	userIdStr := r.URL.Query().Get("userId")
	if userIdStr == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Missing required field: userId"})
		return
	}

	// Parse userId
	var userId int64 = 1 // Use 1 for simplicity in tests

	// Get filters
	var isTemplate *bool
	isTemplateStr := r.URL.Query().Get("isTemplate")
	if isTemplateStr != "" {
		isTemplateBool := isTemplateStr == "true"
		isTemplate = &isTemplateBool
	}

	var isPublic *bool
	isPublicStr := r.URL.Query().Get("isPublic")
	if isPublicStr != "" {
		isPublicBool := isPublicStr == "true"
		isPublic = &isPublicBool
	}

	// Call service
	plans, err := h.mockService.GetPlanByUserId(context.Background(), userId, 100, 0, isTemplate, isPublic)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	planData, _ := json.Marshal(plans)
	_, err = w.Write(planData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
