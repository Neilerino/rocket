package api_utils

import (
	"backend/db"
	"context"
	"encoding/json"
	"net/http"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

func WriteError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(ErrorResponse{
		Error: message,
	})
}

func WithTransaction(ctx context.Context, db *db.Database, w http.ResponseWriter, fn func(*db.Queries) error) bool {
	queries, tx, err := db.TxQueries(ctx)
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "Database error: "+err.Error())
		return false
	}

	if err := fn(queries); err != nil {
		WriteError(w, http.StatusInternalServerError, err.Error())
		return false
	}

	if err := tx.Commit(ctx); err != nil {
		if tx_err := tx.Rollback(ctx); tx_err != nil {
			WriteError(w, http.StatusInternalServerError, "Database error: "+err.Error()+" (rollback error: "+tx_err.Error()+")")
			return false
		}
		WriteError(w, http.StatusInternalServerError, "Database error: "+err.Error())
		return false
	}

	return true
}
