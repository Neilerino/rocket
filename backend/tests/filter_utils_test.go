package tests

import (
	"backend/internal/api/utils"
	"net/http"
	"net/url"
	"testing"
)

// TestFilterParser tests the filter parser utility used in the API handlers
func TestFilterParser(t *testing.T) {
	// Create a mock request with query parameters
	mockURL, _ := url.Parse("http://example.com/api/plans?userId=1&isTemplate=true&isPublic=false&limit=50&offset=10")
	mockRequest := &http.Request{
		URL: mockURL,
	}

	// Create a filter parser with logging enabled
	filterParser := api_utils.NewFilterParser(mockRequest, true)

	// Test case 1: Get integer filter
	t.Run("GetIntFilter", func(t *testing.T) {
		userId := filterParser.GetIntFilter("userId")
		if userId == nil {
			t.Errorf("Expected userId to be non-nil")
		} else if *userId != 1 {
			t.Errorf("Expected userId to be 1, got %d", *userId)
		}

		// Test non-existent parameter
		nonExistent := filterParser.GetIntFilter("nonExistent")
		if nonExistent != nil {
			t.Errorf("Expected nonExistent to be nil, got %d", *nonExistent)
		}

		// Test invalid integer
		mockURLInvalid, _ := url.Parse("http://example.com/api/plans?invalidInt=abc")
		mockRequestInvalid := &http.Request{
			URL: mockURLInvalid,
		}
		invalidParser := api_utils.NewFilterParser(mockRequestInvalid, false)
		invalidInt := invalidParser.GetIntFilter("invalidInt")
		if invalidInt != nil {
			t.Errorf("Expected invalidInt to be nil for non-integer value")
		}
	})

	// Test case 2: Get boolean filter
	t.Run("GetBoolFilter", func(t *testing.T) {
		isTemplate := filterParser.GetBoolFilter("isTemplate")
		if isTemplate == nil {
			t.Errorf("Expected isTemplate to be non-nil")
		} else if !*isTemplate {
			t.Errorf("Expected isTemplate to be true")
		}

		isPublic := filterParser.GetBoolFilter("isPublic")
		if isPublic == nil {
			t.Errorf("Expected isPublic to be non-nil")
		} else if *isPublic {
			t.Errorf("Expected isPublic to be false")
		}

		// Test non-existent parameter
		nonExistent := filterParser.GetBoolFilter("nonExistent")
		if nonExistent != nil {
			t.Errorf("Expected nonExistent to be nil")
		}

		// Test invalid boolean (current implementation treats any non-"true" value as false)
		mockURLInvalid, _ := url.Parse("http://example.com/api/plans?invalidBool=notABool")
		mockRequestInvalid := &http.Request{
			URL: mockURLInvalid,
		}
		invalidParser := api_utils.NewFilterParser(mockRequestInvalid, false)
		invalidBool := invalidParser.GetBoolFilter("invalidBool")
		if invalidBool == nil {
			t.Errorf("Expected invalidBool to be non-nil")
		} else if *invalidBool != false {
			t.Errorf("Expected invalidBool to be false for non-'true' value")
		}
	})

	// Test case 3: Get limit and offset
	t.Run("GetLimitAndOffset", func(t *testing.T) {
		limit := filterParser.GetLimit(100)
		if limit != 50 {
			t.Errorf("Expected limit to be 50, got %d", limit)
		}

		offset := filterParser.GetOffset(0)
		if offset != 10 {
			t.Errorf("Expected offset to be 10, got %d", offset)
		}

		// Test default values
		mockURLNoParams, _ := url.Parse("http://example.com/api/plans")
		mockRequestNoParams := &http.Request{
			URL: mockURLNoParams,
		}
		noParamsParser := api_utils.NewFilterParser(mockRequestNoParams, false)
		
		defaultLimit := noParamsParser.GetLimit(25)
		if defaultLimit != 25 {
			t.Errorf("Expected default limit to be 25, got %d", defaultLimit)
		}

		defaultOffset := noParamsParser.GetOffset(5)
		if defaultOffset != 5 {
			t.Errorf("Expected default offset to be 5, got %d", defaultOffset)
		}
	})
}
