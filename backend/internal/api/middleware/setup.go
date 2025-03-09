package middleware

import (
	"encoding/json"
	"net/http"
)

// ApplyMiddleware applies the standardized response middleware to an http.Handler
func ApplyMiddleware(handler http.Handler) http.Handler {
	// Add the response middleware
	return ResponseMiddleware(handler)
}

// Apply all desired middleware to a handler function
func WrapHandlerFunc(handlerFunc http.HandlerFunc) http.Handler {
	return ApplyMiddleware(handlerFunc)
}

// ResponseJsonWriter is a helper for handlers that want to write JSON responses
// in the standardized format directly
type ResponseJsonWriter struct {
	http.ResponseWriter
}

// WriteSuccess writes a successful JSON response with data in the standardized format
func (w *ResponseJsonWriter) WriteSuccess(data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	response := StandardizeResponse(data)
	writeJson(w.ResponseWriter, http.StatusOK, response)
}

// WriteError writes an error response in the standardized format
func (w *ResponseJsonWriter) WriteError(statusCode int, message string, details string) {
	w.Header().Set("Content-Type", "application/json")
	response := StandardizeErrorResponse(statusCode, message, details)
	writeJson(w.ResponseWriter, statusCode, response)
}

// Internal helper to write JSON
func writeJson(w http.ResponseWriter, statusCode int, response interface{}) {
	w.WriteHeader(statusCode)
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(response); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
