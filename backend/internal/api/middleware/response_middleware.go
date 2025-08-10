package middleware

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
)

// ApiResponseWrapper represents the standardized API response format
// that matches the frontend's ApiResponse<T> interface:
//
//	export interface ApiResponse<T> {
//	  success: boolean;
//	  data?: T;
//	  error?: ApiError;
//	  meta?: Record<string, any>;
//	}
type ApiResponseWrapper struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   *ApiError   `json:"error,omitempty"`
	Meta    interface{} `json:"meta,omitempty"`
}

// ApiError represents the error structure expected by the frontend
type ApiError struct {
	Code    string `json:"code,omitempty"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

// ResponseMiddleware ensures all API responses conform to the ApiResponseWrapper format
func ResponseMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Create a response recorder to capture the response
		rec := httptest.NewRecorder()

		// Call the next handler with our recorder
		next.ServeHTTP(rec, r)

		// Get the response from the recorder
		response := rec.Result()
		defer response.Body.Close()

		// Read the response body
		body, err := io.ReadAll(response.Body)
		if err != nil {
			http.Error(w, "Error reading response body", http.StatusInternalServerError)
			return
		}

		// Copy all headers from the response to the writer
		for k, v := range response.Header {
			for _, val := range v {
				w.Header().Add(k, val)
			}
		}

		// Check if the response is already in the correct format
		if isApiResponseFormat(body) {
			// Just write the response as is
			w.WriteHeader(response.StatusCode)
			_, err := w.Write(body)
			if err != nil {
				http.Error(w, "Error writing response body", http.StatusInternalServerError)
				return
			}
			return
		}

		// Create a standardized response
		standardizedResponse := ApiResponseWrapper{
			Success: response.StatusCode >= 200 && response.StatusCode < 300,
		}

		// Handle different status codes
		if response.StatusCode >= 400 {
			// Error response
			var errorMessage string
			var errorDetails string

			// Try to parse the error response body
			if len(body) > 0 {
				var parsedError map[string]interface{}
				if err := json.Unmarshal(body, &parsedError); err == nil {
					if msg, ok := parsedError["error"].(string); ok {
						errorMessage = msg
					}
				} else {
					// Use the raw body as the error message
					errorMessage = string(body)
				}
			} else {
				// Use default error message based on status code
				errorMessage = http.StatusText(response.StatusCode)
			}

			standardizedResponse.Error = &ApiError{
				Code:    http.StatusText(response.StatusCode),
				Message: errorMessage,
				Details: errorDetails,
			}
		} else if len(body) > 0 {
			// Successful response with body
			var parsedData interface{}
			if err := json.Unmarshal(body, &parsedData); err != nil {
				// If we can't parse the JSON, use it as raw data
				standardizedResponse.Data = string(body)
			} else {
				standardizedResponse.Data = parsedData
			}
		}

		// Set content type header for our JSON response
		w.Header().Set("Content-Type", "application/json")

		// Write the status code
		w.WriteHeader(response.StatusCode)

		// Write the standardized response
		if err := json.NewEncoder(w).Encode(standardizedResponse); err != nil {
			log.Printf("Error encoding response: %v", err)
		}
	})
}

// isApiResponseFormat checks if the response is already in the ApiResponseWrapper format
func isApiResponseFormat(body []byte) bool {
	if len(body) == 0 {
		return false
	}

	var response map[string]interface{}
	if err := json.Unmarshal(body, &response); err != nil {
		return false
	}

	// Check if the response has the "success" field which is characteristic of our format
	_, hasSuccess := response["success"]
	return hasSuccess
}

// StandardizeResponse is a utility function to create an ApiResponseWrapper with data
func StandardizeResponse(data interface{}) ApiResponseWrapper {
	return ApiResponseWrapper{
		Success: true,
		Data:    data,
	}
}

// StandardizeErrorResponse is a utility function to create an ApiResponseWrapper with error
func StandardizeErrorResponse(statusCode int, message string, details string) ApiResponseWrapper {
	return ApiResponseWrapper{
		Success: false,
		Error: &ApiError{
			Code:    http.StatusText(statusCode),
			Message: message,
			Details: details,
		},
	}
}
