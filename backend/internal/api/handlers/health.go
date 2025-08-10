package handlers

import (
	"encoding/json"
	"log"
	"net/http"
)

type HealthHandler struct{}

func (h *HealthHandler) Health(w http.ResponseWriter, r *http.Request) {
	println("Health check")

	w.WriteHeader(http.StatusOK)
	err := json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	if err != nil {
		log.Printf("Error encoding response: %v", err)
	}
}
