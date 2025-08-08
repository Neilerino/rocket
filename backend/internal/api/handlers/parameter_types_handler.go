package handlers

import (
	"backend/db"
	"backend/db/repository"
	api_utils "backend/internal/api/utils"
	"backend/internal/types"
	"encoding/json"
	"net/http"
)

type ParameterTypesHandler struct {
	Db *db.Database
}

// Helper function to convert DB ParameterType to API ParameterType
func dbParameterTypeToApiParameterType(dbParamType db.ParameterType) types.ParameterType {
	return types.ParameterType{
		ID:          dbParamType.ID,
		Name:        dbParamType.Name,
		DataType:    dbParamType.DataType,
		DefaultUnit: dbParamType.DefaultUnit,
		MinValue:    dbParamType.MinValue.Float64,
		MaxValue:    dbParamType.MaxValue.Float64,
	}
}

// Helper function to convert slice of DB ParameterTypes to API ParameterTypes
func dbParameterTypesToApiParameterTypes(dbParamTypes []db.ParameterType) []types.ParameterType {
	result := make([]types.ParameterType, len(dbParamTypes))
	for i, dbParamType := range dbParamTypes {
		result[i] = dbParameterTypeToApiParameterType(dbParamType)
	}
	return result
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
		// Create repository directly - no service layer needed
		parameterTypeRepo := repository.NewParameterTypesRepository(queries)

		// Call repository to get parameter types
		dbParameterTypes, err := parameterTypeRepo.List(r.Context(), repository.ListParameterTypesParams{
			UserId:          userId,
			ParameterTypeId: parameterTypeId,
			Limit:           int32(limit),
			Offset:          int32(offset),
		})
		if err != nil {
			return err
		}

		// Convert DB parameter types to API parameter types
		apiParameterTypes := dbParameterTypesToApiParameterTypes(dbParameterTypes)

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(apiParameterTypes)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}
