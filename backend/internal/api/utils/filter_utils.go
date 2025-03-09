package api_utils

import (
	"log"
	"net/http"
	"strconv"
	"strings"
)

// FilterParser provides utility functions for parsing API filter parameters
type FilterParser struct {
	Request *http.Request
	Logger  bool // Whether to log parsing operations
}

// NewFilterParser creates a new FilterParser for the given request
func NewFilterParser(r *http.Request, enableLogging bool) *FilterParser {
	return &FilterParser{
		Request: r,
		Logger:  enableLogging,
	}
}

// GetUserID extracts and parses the user ID from query parameters
// It checks for "userId" parameter and returns an error if not found or invalid
func (fp *FilterParser) GetUserID() (int64, error) {
	userIdParam := fp.Request.URL.Query().Get("userId")
	if userIdParam == "" {
		if fp.Logger {
			log.Printf("Error: Missing user ID parameter")
		}
		return -1, ErrMissingParameter("userId")
	}
	
	if fp.Logger {
		log.Printf("Using userId parameter: %s", userIdParam)
	}
	
	userId, err := ParseBigInt(userIdParam)
	if err != nil {
		if fp.Logger {
			log.Printf("Error parsing user ID: %v", err)
		}
		return -1, ErrInvalidParameter("userId")
	}
	
	if fp.Logger {
		log.Printf("Parsed userId: %d", userId)
	}
	
	return userId, nil
}

// GetLimit extracts and parses the limit parameter with a default value
func (fp *FilterParser) GetLimit(defaultLimit int32) int32 {
	limit := defaultLimit
	if limitParam := fp.Request.URL.Query().Get("limit"); limitParam != "" {
		limitInt, err := strconv.Atoi(limitParam)
		if err == nil && limitInt > 0 {
			limit = int32(limitInt)
		}
	}
	
	if fp.Logger {
		log.Printf("Using limit: %d", limit)
	}
	
	return limit
}

// GetOffset extracts and parses the offset parameter with a default value
func (fp *FilterParser) GetOffset(defaultOffset int) int {
	offset := defaultOffset
	if offsetParam := fp.Request.URL.Query().Get("offset"); offsetParam != "" {
		offsetInt, err := strconv.Atoi(offsetParam)
		if err == nil && offsetInt >= 0 {
			offset = offsetInt
		}
	}
	
	if fp.Logger {
		log.Printf("Using offset: %d", offset)
	}
	
	return offset
}

// GetBoolFilter extracts and parses a boolean filter parameter
// Returns a pointer to bool if the parameter exists and is a valid boolean, nil otherwise
func (fp *FilterParser) GetBoolFilter(paramName string) *bool {
	var result *bool
	
	// Try both filter format and regular format
	paramValue := fp.Request.URL.Query().Get("filters[" + paramName + "]")
	if paramValue == "" {
		paramValue = fp.Request.URL.Query().Get(paramName)
	}
	
	if paramValue != "" {
		// Check if the value is a valid boolean (true/false, case-insensitive)
		switch strings.ToLower(paramValue) {
		case "true", "1", "yes", "y", "on":
			boolValue := true
			result = &boolValue
		case "false", "0", "no", "n", "off":
			boolValue := false
			result = &boolValue
		default:
			// For backward compatibility, treat any other value as false
			// This maintains compatibility with existing code that expects this behavior
			boolValue := false
			result = &boolValue
			if fp.Logger {
				log.Printf("Warning: Invalid boolean value '%s' for parameter '%s', treating as false", paramValue, paramName)
			}
		}
		
		if fp.Logger && result != nil {
			log.Printf("Using %s filter: %v", paramName, *result)
		}
	}
	
	return result
}

// GetBoolFilterWithDefault extracts and parses a boolean filter parameter
// Returns the parsed value if the parameter exists and is valid, otherwise returns the default value
func (fp *FilterParser) GetBoolFilterWithDefault(paramName string, defaultValue bool) bool {
	result := fp.GetBoolFilter(paramName)
	if result == nil {
		if fp.Logger {
			log.Printf("Using default value for %s filter: %v", paramName, defaultValue)
		}
		return defaultValue
	}
	return *result
}

// GetBoolFilterOrFalse extracts and parses a boolean filter parameter
// Returns the parsed value if the parameter exists and is valid, otherwise returns false
func (fp *FilterParser) GetBoolFilterOrFalse(paramName string) bool {
	return fp.GetBoolFilterWithDefault(paramName, false)
}

// GetStringFilter extracts a string filter parameter
// Returns the string value if the parameter exists, empty string otherwise
func (fp *FilterParser) GetStringFilter(paramName string) string {
	// Try both filter format and regular format
	paramValue := fp.Request.URL.Query().Get("filters[" + paramName + "]")
	if paramValue == "" {
		paramValue = fp.Request.URL.Query().Get(paramName)
	}
	
	if paramValue != "" && fp.Logger {
		log.Printf("Using %s filter: %s", paramName, paramValue)
	}
	
	return paramValue
}

// GetStringFilterWithDefault extracts a string filter parameter
// Returns the string value if the parameter exists and is not empty, otherwise returns the default value
func (fp *FilterParser) GetStringFilterWithDefault(paramName string, defaultValue string) string {
	result := fp.GetStringFilter(paramName)
	if result == "" {
		if fp.Logger {
			log.Printf("Using default value for %s filter: %s", paramName, defaultValue)
		}
		return defaultValue
	}
	return result
}

// GetIntFilter extracts and parses an integer filter parameter
// Returns a pointer to int64 if the parameter exists and is valid, nil otherwise
func (fp *FilterParser) GetIntFilter(paramName string) *int64 {
	var result *int64
	
	// Try both filter format and regular format
	paramValue := fp.Request.URL.Query().Get("filters[" + paramName + "]")
	if paramValue == "" {
		paramValue = fp.Request.URL.Query().Get(paramName)
	}
	
	if paramValue != "" {
		intValue, err := ParseBigInt(paramValue)
		if err == nil {
			result = &intValue
			
			if fp.Logger {
				log.Printf("Using %s filter: %d", paramName, intValue)
			}
		} else if fp.Logger {
			log.Printf("Invalid %s filter value: %s", paramName, paramValue)
		}
	}
	
	return result
}

// GetIntFilterWithDefault extracts and parses an integer filter parameter
// Returns the parsed value if the parameter exists and is valid, otherwise returns the default value
func (fp *FilterParser) GetIntFilterWithDefault(paramName string, defaultValue int64) int64 {
	result := fp.GetIntFilter(paramName)
	if result == nil {
		if fp.Logger {
			log.Printf("Using default value for %s filter: %d", paramName, defaultValue)
		}
		return defaultValue
	}
	return *result
}

// GetIntFilterOrZero extracts and parses an integer filter parameter
// Returns the parsed value if the parameter exists and is valid, otherwise returns 0
func (fp *FilterParser) GetIntFilterOrZero(paramName string) int64 {
	return fp.GetIntFilterWithDefault(paramName, 0)
}

// ErrMissingParameter creates an error for a missing required parameter
func ErrMissingParameter(paramName string) error {
	return &FilterError{
		Message: "Missing required parameter: " + paramName,
		Code:    "MISSING_PARAMETER",
	}
}

// ErrInvalidParameter creates an error for an invalid parameter value
func ErrInvalidParameter(paramName string) error {
	return &FilterError{
		Message: "Invalid parameter value: " + paramName,
		Code:    "INVALID_PARAMETER",
	}
}

// FilterError represents an error that occurred during filter parsing
type FilterError struct {
	Message string
	Code    string
}

func (e *FilterError) Error() string {
	return e.Message
}

// HasFilter checks if a parameter exists in the request
func (fp *FilterParser) HasFilter(paramName string) bool {
	// Try both filter format and regular format
	paramValue := fp.Request.URL.Query().Get("filters[" + paramName + "]")
	if paramValue == "" {
		paramValue = fp.Request.URL.Query().Get(paramName)
	}
	
	return paramValue != ""
}
