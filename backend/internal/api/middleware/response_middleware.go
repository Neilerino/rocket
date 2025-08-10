package middleware

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
)

type ApiResponseWrapper struct {
	Success bool      `json:"success"`
	Data    any       `json:"data,omitempty"`
	Error   *ApiError `json:"error,omitempty"`
	Meta    any       `json:"meta,omitempty"`
}

type ApiError struct {
	Code    string `json:"code,omitempty"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

func ResponseMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rec := httptest.NewRecorder()
		next.ServeHTTP(rec, r)

		response := rec.Result()
		body, err := io.ReadAll(response.Body)
		if err != nil {
			http.Error(w, "Error reading response body", http.StatusInternalServerError)
			return
		}

		for k, v := range response.Header {
			for _, val := range v {
				w.Header().Add(k, val)
			}
		}

		if isApiResponseFormat(body) {
			w.WriteHeader(response.StatusCode)
			_, err := w.Write(body)
			if err != nil {
				http.Error(w, "Error writing response body", http.StatusInternalServerError)
				return
			}
			return
		}

		standardizedResponse := ApiResponseWrapper{
			Success: response.StatusCode >= 200 && response.StatusCode < 300,
		}

		if response.StatusCode >= 400 {
			var errorMessage string
			var errorDetails string

			if len(body) > 0 {
				var parsedError map[string]any
				if err := json.Unmarshal(body, &parsedError); err == nil {
					if msg, ok := parsedError["error"].(string); ok {
						errorMessage = msg
					}
				} else {
					errorMessage = string(body)
				}
			} else {
				errorMessage = http.StatusText(response.StatusCode)
			}

			standardizedResponse.Error = &ApiError{
				Code:    http.StatusText(response.StatusCode),
				Message: errorMessage,
				Details: errorDetails,
			}
		} else if len(body) > 0 {
			var parsedData any
			if err := json.Unmarshal(body, &parsedData); err != nil {
				standardizedResponse.Data = string(body)
			} else {
				standardizedResponse.Data = parsedData
			}
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(response.StatusCode)

		if err := json.NewEncoder(w).Encode(standardizedResponse); err != nil {
			log.Printf("Error encoding response: %v", err)
		}
	})
}

func isApiResponseFormat(body []byte) bool {
	if len(body) == 0 {
		return false
	}

	var response map[string]any
	if err := json.Unmarshal(body, &response); err != nil {
		return false
	}

	// Check if the response has the "success" field which is characteristic of our format
	_, hasSuccess := response["success"]
	return hasSuccess
}

// StandardizeResponse is a utility function to create an ApiResponseWrapper with data
func StandardizeResponse(data any) ApiResponseWrapper {
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
