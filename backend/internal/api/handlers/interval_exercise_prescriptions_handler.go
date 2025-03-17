package handlers

import (
	"backend/db"
	api_utils "backend/internal/api/utils"
	"backend/internal/service"
	"encoding/json"
	"net/http"
)

type IntervalExercisePrescriptionsHandler struct {
	Db *db.Database
}

type CreateIntervalExercisePrescriptionApiArgs struct {
	GroupId             int64   `json:"groupId"`
	ExerciseVariationId int64   `json:"exerciseVariationId"`
	PlanIntervalId      int64   `json:"planIntervalId"`
	RPE                 float64 `json:"rpe"`
	Sets                int32   `json:"sets"`
	Reps                int32   `json:"reps"`
	Duration            string  `json:"duration"`
	Rest                string  `json:"rest"`
}

func (h *IntervalExercisePrescriptionsHandler) List(w http.ResponseWriter, r *http.Request) {
	filterParser := api_utils.NewFilterParser(r, true)

	groupId := filterParser.GetIntFilterOrZero("groupId")
	intervalId := filterParser.GetIntFilterOrZero("intervalId")

	limit := filterParser.GetLimit(100)
	offset := filterParser.GetIntFilterOrZero("offset")

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		prescription_service := service.NewIntervalExercisePrescriptionsService(queries)

		prescriptions, err := prescription_service.List(r.Context(), service.IntervalExercisePrescriptionListParams{
			GroupId:    &groupId,
			IntervalId: &intervalId,
			Limit:      int32(limit),
			Offset:     int32(offset),
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

func (h *IntervalExercisePrescriptionsHandler) Create(w http.ResponseWriter, r *http.Request) {
	var args CreateIntervalExercisePrescriptionApiArgs
	if err := json.NewDecoder(r.Body).Decode(&args); err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		prescription_service := service.NewIntervalExercisePrescriptionsService(queries)

		prescription, err := prescription_service.CreateOne(r.Context(), service.PrescriptionCreateData{
			GroupId:        args.GroupId,
			ExerciseId:     args.ExerciseVariationId,
			VariationId:    args.ExerciseVariationId,
			PlanIntervalId: args.PlanIntervalId,
			Rpe:            int32(args.RPE),
			Sets:           args.Sets,
			Reps:           args.Reps,
			Duration:       args.Duration,
			Rest:           args.Rest,
		})
		if err != nil {
			return err
		}

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(prescription)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}
