package handlers

import (
	"backend/db"
	api_utils "backend/internal/api/utils"
	service "backend/internal/service"
	"encoding/json"
	"net/http"
)

type ParameterTypesHandler struct {
	Db *db.Database
}

func (h *ParameterTypesHandler) List(w http.ResponseWriter, r *http.Request) {
	filterParser := api_utils.NewFilterParser(r, true)

	userId := filterParser.GetIntFilterOrZero("userId")
	parameterTypeId := filterParser.GetIntFilterOrZero("parameterTypeId")

	if userId == 0 && parameterTypeId == 0 {
		api_utils.WriteError(w, http.StatusBadRequest, "Missing required field: userId or parameterTypeId")
		return
	}

	limit := filterParser.GetLimit(100)
	offset := filterParser.GetIntFilterOrZero("offset")

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		parameter_type_service := service.NewParameterTypesService(queries)

		prescriptions, err := parameter_type_service.List(r.Context(), service.ListParameterTypesParams{
			UserId:          &userId,
			ParameterTypeId: &parameterTypeId,
			Limit:           int32(limit),
			Offset:          int32(offset),
		})
		if err != nil {
			return err
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(prescriptions)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}
