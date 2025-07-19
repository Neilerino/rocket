package main

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
	"time"
)

// Simple test script to verify the Plans List API with different filter combinations
func test_main() {
	baseURL := "http://localhost:8080/api/plans"

	// Test cases for different filter combinations
	testCases := []struct {
		name   string
		params url.Values
	}{
		{
			name:   "Filter by userId only",
			params: url.Values{"userId": []string{"1"}},
		},
		{
			name:   "Filter by planId only",
			params: url.Values{"planId": []string{"1"}},
		},
		{
			name:   "Filter by both userId and planId",
			params: url.Values{"userId": []string{"1"}, "planId": []string{"1"}},
		},
		{
			name:   "Filter by userId with isTemplate=true",
			params: url.Values{"userId": []string{"1"}, "isTemplate": []string{"true"}},
		},
		{
			name:   "Filter by userId with isPublic=true",
			params: url.Values{"userId": []string{"1"}, "isPublic": []string{"true"}},
		},
		{
			name:   "No filters (should return error)",
			params: url.Values{},
		},
	}

	// Run each test case
	for _, tc := range testCases {
		fmt.Printf("\n=== Testing: %s ===\n", tc.name)

		// Build the URL with query parameters
		fullURL := baseURL
		if len(tc.params) > 0 {
			fullURL += "?" + tc.params.Encode()
		}

		// Make the request
		fmt.Printf("Request URL: %s\n", fullURL)
		resp, err := http.Get(fullURL)
		if err != nil {
			log.Printf("Error making request: %v\n", err)
			continue
		}

		// Print the response status
		fmt.Printf("Response Status: %s\n", resp.Status)

		// Close the response body
		resp.Body.Close()

		// Add a small delay between requests
		time.Sleep(500 * time.Millisecond)
	}
}
