package api_utils

import (
	"backend/db"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"runtime"
	"path/filepath"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

// logErrorWithLocation logs an error with file and line information
func logErrorWithLocation(err error) {
	if err != nil {
		_, file, line, ok := runtime.Caller(2) // Get caller of the function that called logErrorWithLocation
		if ok {
			file = filepath.Base(file)
			log.Printf("ERROR [%s:%d] %v", file, line, err)
		} else {
			log.Printf("ERROR: %v", err)
		}
	}
}

func WriteError(w http.ResponseWriter, status int, message string) {
	// Log the error with its location
	log.Printf("HTTP %d Error: %s", status, message)
	_, file, line, ok := runtime.Caller(1)
	if ok {
		file = filepath.Base(file)
		log.Printf("  at %s:%d", file, line)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(ErrorResponse{
		Error: message,
	})
}

func WithTransaction(ctx context.Context, db *db.Database, w http.ResponseWriter, fn func(*db.Queries) error) bool {
	queries, tx, err := db.TxQueries(ctx)
	if err != nil {
		logErrorWithLocation(err)
		WriteError(w, http.StatusInternalServerError, "Database error: "+err.Error())
		return false
	}

	if err := fn(queries); err != nil {
		logErrorWithLocation(err)
		log.Printf("Transaction function error: %v", err)
		WriteError(w, http.StatusInternalServerError, err.Error())
		return false
	}

	if err := tx.Commit(ctx); err != nil {
		logErrorWithLocation(err)
		if tx_err := tx.Rollback(ctx); tx_err != nil {
			logErrorWithLocation(tx_err)
			log.Printf("Rollback failed: %v", tx_err)
			WriteError(w, http.StatusInternalServerError, "Database error: "+err.Error()+" (rollback error: "+tx_err.Error()+")")
			return false
		}
		WriteError(w, http.StatusInternalServerError, "Database error: "+err.Error())
		return false
	}

	return true
}
