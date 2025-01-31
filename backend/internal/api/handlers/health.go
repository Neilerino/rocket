package handlers

import (
	"encoding/json"
	"net/http"
)

type HealthHandler struct{}

func (h *HealthHandler) Health(w http.ResponseWriter, r *http.Request) {
	println("Health check")

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
