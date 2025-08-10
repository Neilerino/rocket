package handlers

import (
	"backend/db"
	"backend/db/repository"
	api_utils "backend/internal/api/utils"
	"backend/internal/types"
	"backend/internal/utils"
	"encoding/json"
	"errors"
	"log"
	"net/http"
)

type IntervalExercisePrescriptionsHandler struct {
	Db *db.Database
}

type CreateIntervalExercisePrescriptionApiArgs struct {
	GroupId             int64   `json:"groupId"`
	ExerciseVariationId int64   `json:"exerciseVariationId"`
	PlanIntervalId      int64   `json:"planIntervalId"`
	RPE                 *int32  `json:"rpe"`
	Sets                int32   `json:"sets"`
	Reps                *int32  `json:"reps"`
	Duration            *string `json:"duration"`
	SubReps             *int32  `json:"subReps"`
	SubRepWorkDuration  *string `json:"subRepWorkDuration"`
	SubRepRestDuration  *string `json:"subRepRestDuration"`
	Rest                *string `json:"rest"`
}

// Helper function to convert the new detailed prescription rows to API format
func dbPrescriptionDetailRowsToApiPrescriptions(rows []db.IntervalExercisePrescriptions_ListWithDetailsRow) []types.IntervalExercisePrescription {
	prescriptionsMap := make(map[int64]*types.IntervalExercisePrescription)
	variationsMap := make(map[int64]*types.ExerciseVariation)

	for _, row := range rows {
		// Handle prescription data
		if _, exists := prescriptionsMap[row.ID]; !exists {
			var duration *types.PostgreSQLInterval
			var rest *types.PostgreSQLInterval
			var subRepWorkDuration *types.PostgreSQLInterval
			var subRepRestDuration *types.PostgreSQLInterval

			if row.Duration.Valid {
				pgInterval := types.NewPostgreSQLInterval(row.Duration)
				duration = &pgInterval
			}

			if row.Rest.Valid {
				pgInterval := types.NewPostgreSQLInterval(row.Rest)
				rest = &pgInterval
			}

			if row.SubRepWorkDuration.Valid {
				pgInterval := types.NewPostgreSQLInterval(row.SubRepWorkDuration)
				subRepWorkDuration = &pgInterval
			}

			if row.SubRepRestDuration.Valid {
				pgInterval := types.NewPostgreSQLInterval(row.SubRepRestDuration)
				subRepRestDuration = &pgInterval
			}

			prescriptionsMap[row.ID] = &types.IntervalExercisePrescription{
				ID:                  row.ID,
				GroupId:             row.GroupID,
				ExerciseVariationId: row.ExerciseVariationID,
				PlanIntervalId:      row.PlanIntervalID,
				RPE:                 utils.If(row.Rpe.Valid, &row.Rpe.Int32, nil),
				Sets:                row.Sets,
				Reps:                utils.If(row.Reps.Valid, &row.Reps.Int32, nil),
				Duration:            duration,
				Rest:                rest,
				SubReps:             utils.If(row.SubReps.Valid, &row.SubReps.Int32, nil),
				SubRepWorkDuration:  subRepWorkDuration,
				SubRepRestDuration:  subRepRestDuration,
			}
		}

		// Handle variation data (only if not already processed)
		if _, exists := variationsMap[row.ExerciseVariationID]; !exists {
			variationsMap[row.ExerciseVariationID] = &types.ExerciseVariation{
				ID:         row.EvID,
				ExerciseId: row.EvExerciseID,
				Exercise: types.Exercise{
					ID:          row.EID,
					Name:        row.EName,
					Description: row.EDescription,
					UserID:      row.EUserID.Int64,
					CreatedAt:   row.ECreatedAt.Time.String(),
					UpdatedAt:   row.EUpdatedAt.Time.String(),
				},
				Parameters: []types.ExerciseVariationParam{},
			}
		}

		// Handle parameter data
		if row.EvpID.Valid && variationsMap[row.ExerciseVariationID] != nil {
			param := types.ExerciseVariationParam{
				ID:                  row.EvpID.Int64,
				ExerciseVariationId: row.ExerciseVariationID,
				Locked:              row.EvpLocked.Bool,
				ParameterTypeId:     row.PtID.Int64,
				ParameterType: types.ParameterType{
					ID:          row.PtID.Int64,
					Name:        row.PtName.String,
					DataType:    row.PtDataType.String,
					DefaultUnit: row.PtDefaultUnit.String,
					MinValue:    row.PtMinValue.Float64,
					MaxValue:    row.PtMaxValue.Float64,
				},
			}
			variationsMap[row.ExerciseVariationID].Parameters = append(
				variationsMap[row.ExerciseVariationID].Parameters, 
				param,
			)
		}
	}

	// Assign variations to prescriptions
	for _, prescription := range prescriptionsMap {
		if variation, exists := variationsMap[prescription.ExerciseVariationId]; exists {
			prescription.ExerciseVariation = *variation
		}
	}

	// Convert to slice
	prescriptions := make([]types.IntervalExercisePrescription, 0, len(prescriptionsMap))
	for _, prescription := range prescriptionsMap {
		prescriptions = append(prescriptions, *prescription)
	}

	return prescriptions
}

func (h *IntervalExercisePrescriptionsHandler) List(w http.ResponseWriter, r *http.Request) {
	filterParser := api_utils.NewFilterParser(r, true)

	groupId := filterParser.GetIntFilterOrZero("groupId")
	intervalId := filterParser.GetIntFilterOrZero("intervalId")

	limit := filterParser.GetLimit(100)
	offset := filterParser.GetIntFilterOrZero("offset")

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		// Create repository using the new dedicated query approach
		prescriptionRepo := repository.NewIntervalExercisePrescriptionsRepository(queries)

		// Use the new dedicated query that joins all necessary tables
		dbRows, err := prescriptionRepo.ListWithDetails(r.Context(), repository.IntervalExercisePrescriptionListParams{
			PrescriptionId: 0,
			ExerciseId:     0,
			IntervalId:     intervalId,
			GroupId:        groupId,
			Limit:          int32(limit),
			Offset:         int32(offset),
		})
		if err != nil {
			return err
		}

		// Convert to API format using the new helper function
		apiPrescriptions := dbPrescriptionDetailRowsToApiPrescriptions(dbRows)

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(apiPrescriptions)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *IntervalExercisePrescriptionsHandler) Create(w http.ResponseWriter, r *http.Request) {
	var args CreateIntervalExercisePrescriptionApiArgs
	if err := json.NewDecoder(r.Body).Decode(&args); err != nil {
		log.Printf("Error decoding request body: %v", err)
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		// Create repository using the dedicated approach
		prescriptionRepo := repository.NewIntervalExercisePrescriptionsRepository(queries)

		// Create the prescription
		dbPrescription, err := prescriptionRepo.CreateOne(r.Context(), repository.PrescriptionCreateData{
			GroupId:        args.GroupId,
			VariationId:    args.ExerciseVariationId,
			PlanIntervalId: args.PlanIntervalId,
			RPE:            args.RPE,
			Sets:           args.Sets,
			Reps:           args.Reps,
			Duration:       args.Duration,
			Rest:           args.Rest,
		})
		if err != nil {
			return err
		}

		// Get the complete prescription with details using the dedicated query
		dbRows, err := prescriptionRepo.ListWithDetails(r.Context(), repository.IntervalExercisePrescriptionListParams{
			PrescriptionId: dbPrescription.ID,
			ExerciseId:     0,
			IntervalId:     0,
			GroupId:        0,
			Limit:          1,
			Offset:         0,
		})
		if err != nil {
			return err
		}

		if len(dbRows) == 0 {
			return errors.New("created prescription not found")
		}

		// Convert to API format
		apiPrescriptions := dbPrescriptionDetailRowsToApiPrescriptions(dbRows)
		if len(apiPrescriptions) == 0 {
			return errors.New("prescription conversion failed")
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(apiPrescriptions[0])
	})

	if success {
		w.WriteHeader(http.StatusCreated)
	}
}
