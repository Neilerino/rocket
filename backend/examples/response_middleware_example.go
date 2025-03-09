package examples

import (
	"backend/internal/api/middleware"
	"encoding/json"
	"net/http"
)

// ExampleHandler demonstrates using the response middleware
func ExampleHandler(w http.ResponseWriter, r *http.Request) {
	// Example 1: Standard Response - returns automatically wrapped in ApiResponse format
	// This will be wrapped by middleware.ResponseMiddleware to match ApiResponse interface
	type User struct {
		ID    int    `json:"id"`
		Name  string `json:"name"`
		Email string `json:"email"`
	}

	user := User{
		ID:    1,
		Name:  "John Doe",
		Email: "john@example.com",
	}

	// Just write the regular JSON response
	// The middleware will transform it into { success: true, data: { id: 1, name: "John Doe", ... } }
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// ExampleHandlerWithError demonstrates handling errors with the response middleware
func ExampleHandlerWithError(w http.ResponseWriter, r *http.Request) {
	// Example 2: Error Response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNotFound)
	
	// Just write a simple error message
	// The middleware will transform it into { success: false, error: { code: "Not Found", message: "User not found" } }
	json.NewEncoder(w).Encode(map[string]string{
		"error": "User not found",
	})
}

// ExampleHandlerWithDirect demonstrates using the utility functions directly
func ExampleHandlerWithDirect(w http.ResponseWriter, r *http.Request) {
	// Example 3: Direct formatting with utility functions
	type Product struct {
		ID    int     `json:"id"`
		Name  string  `json:"name"`
		Price float64 `json:"price"`
	}

	product := Product{
		ID:    101,
		Name:  "Widget",
		Price: 19.99,
	}

	// Use the ResponseWriter wrapper for convenience
	respWriter := &middleware.ResponseJsonWriter{ResponseWriter: w}
	respWriter.WriteSuccess(product)

	// Alternatively, for errors:
	// respWriter.WriteError(http.StatusBadRequest, "Invalid product data", "Price must be positive")
}

// Complete example with proper error handling
func CompleteExampleHandler(w http.ResponseWriter, r *http.Request) {
	// Get query parameter
	id := r.URL.Query().Get("id")
	
	if id == "" {
		// Return error response if id is missing
		respWriter := &middleware.ResponseJsonWriter{ResponseWriter: w}
		respWriter.WriteError(http.StatusBadRequest, "Missing id parameter", "Please provide an id query parameter")
		return
	}

	// Create sample data
	data := map[string]interface{}{
		"id":      id,
		"name":    "Sample Item",
		"details": "This is a sample response with the standardized format",
		"meta": map[string]interface{}{
			"version": "1.0",
			"timestamp": "2025-03-08T20:18:12-03:30",
		},
	}

	// Return success response
	respWriter := &middleware.ResponseJsonWriter{ResponseWriter: w}
	respWriter.WriteSuccess(data)
}
