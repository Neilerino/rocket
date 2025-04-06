package service

import (
	"backend/db"
	"backend/db/repository"
	"backend/internal/types"
	"backend/internal/utils"
	"context"
	"errors"
	"log"
)

type IntervalExercisePrescriptionsService struct {
	PrescriptionRepo *repository.IntervalExercisePrescriptionsRepository
	ExerciseRepo     *repository.ExercisesRepository
	GroupRepo        *repository.GroupsRepository
	VariationRepo    *repository.ExerciseVariationsRepository
}

type IntervalExercisePrescriptionListParams struct {
	PrescriptionId *int64
	ExerciseId     *int64
	IntervalId     *int64
	GroupId        *int64
	Limit          int32
	Offset         int32
}

type PrescriptionListData struct {
	Id          int64
	VariationID int64
	IntervalId  int64
	GroupId     int64
	Rpe         int32
	Sets        int32
	Reps        int32
	Duration    string
	Rest        string
}

type PrescriptionCreateData struct {
	GroupId        int64
	VariationId    int64
	PlanIntervalId int64
	Rpe            *int32
	Sets           int32
	Reps           *int32
	Duration       *string
	Rest           *string
}

func NewIntervalExercisePrescriptionsService(queries *db.Queries) *IntervalExercisePrescriptionsService {
	return &IntervalExercisePrescriptionsService{
		PrescriptionRepo: repository.NewIntervalExercisePrescriptionsRepository(queries),
		ExerciseRepo:     repository.NewExercisesRepository(queries),
		GroupRepo:        repository.NewGroupsRepository(queries),
		VariationRepo:    repository.NewExerciseVariationsRepository(queries),
	}
}

func (s *IntervalExercisePrescriptionsService) List(ctx context.Context, params IntervalExercisePrescriptionListParams) ([]types.IntervalExercisePrescription, error) {
	if params.ExerciseId == nil && params.IntervalId == nil && params.GroupId == nil {
		return nil, errors.New("at least one of ExerciseId, IntervalId, or GroupId must be specified")
	}

	rows, err := s.PrescriptionRepo.List(ctx, repository.IntervalExercisePrescriptionListParams{
		PrescriptionId: DerefOrDefault(params.PrescriptionId, 0),
		ExerciseId:     DerefOrDefault(params.ExerciseId, 0),
		IntervalId:     DerefOrDefault(params.IntervalId, 0),
		GroupId:        DerefOrDefault(params.GroupId, 0),
		Limit:          params.Limit,
		Offset:         params.Offset,
	})
	if err != nil {
		return nil, err
	}

	var variationIds []int64
	for _, row := range rows {
		variationIds = append(variationIds, row.ExerciseVariationID)
	}

	variation_rows, err := s.VariationRepo.List(ctx, repository.ExerciseVariationListParams{
		VariationId:    variationIds,
		ExerciseId:     []int64{},
		GroupId:        []int64{},
		PlanId:         []int64{},
		PlanIntervalId: []int64{},
		UserId:         0,
		Limit:          params.Limit,
		Offset:         0,
	})

	log.Printf("Successfully retrieved exercise variations for prescriptions, count: %d", len(variation_rows))
	if err != nil {
		return nil, err
	}

	variations := ExerciseVariationRowToApi(variation_rows)

	var variationMap = make(map[int64]types.ExerciseVariation)
	for _, exVariation := range variations {
		variationMap[exVariation.ID] = exVariation
	}

	var prescriptions []types.IntervalExercisePrescription
	for _, row := range rows {
		var duration *string
		var rest *string

		if row.Duration.Valid {
			durationVal, err := utils.IntervalToString(row.Duration)
			if err != nil {
				return nil, err
			}
			duration = &durationVal
		} else {
			duration = nil
		}

		if row.Rest.Valid {
			restVal, err := utils.IntervalToString(row.Rest)
			if err != nil {
				return nil, err
			}
			rest = &restVal
		} else {
			rest = nil
		}

		prescriptions = append(prescriptions, types.IntervalExercisePrescription{
			ID:                  row.ID,
			GroupId:             row.GroupID,
			ExerciseVariationId: row.ExerciseVariationID,
			PlanIntervalId:      row.PlanIntervalID,
			RPE:                 utils.If(row.Rpe.Valid, &row.Rpe.Int32, nil),
			Sets:                row.Sets,
			Reps:                utils.If(row.Reps.Valid, &row.Reps.Int32, nil),
			Duration:            duration,
			Rest:                rest,
			ExerciseVariation:   variationMap[row.ExerciseVariationID],
		})
	}

	return prescriptions, nil
}

func (s *IntervalExercisePrescriptionsService) CreateOne(ctx context.Context, params PrescriptionCreateData) (*types.IntervalExercisePrescription, error) {
	variationService := NewExerciseVariationsService(s.VariationRepo.Queries)

	variations, err := variationService.List(ctx, ExerciseVariationListParams{
		VariationId: &[]int64{params.VariationId},
		Limit:       1,
	})
	if err != nil {
		return nil, err
	}

	if len(variations) == 0 {
		return nil, errors.New("variation not found")
	}

	row, err := s.PrescriptionRepo.CreateOne(ctx, repository.PrescriptionCreateData{
		GroupId:        params.GroupId,
		VariationId:    params.VariationId,
		PlanIntervalId: params.PlanIntervalId,
		RPE:            params.Rpe,
		Sets:           params.Sets,
		Reps:           params.Reps,
		Duration:       params.Duration,
		Rest:           params.Rest,
	})
	if err != nil {
		return nil, err
	}

	prescriptions, err := s.List(ctx, IntervalExercisePrescriptionListParams{
		PrescriptionId: &row.ID,
		GroupId:        &params.GroupId,
		Limit:          1,
		Offset:         0,
	})
	if err != nil {
		return nil, err
	}

	if len(prescriptions) == 0 {
		return nil, errors.New("created prescription not found")
	}

	return &prescriptions[0], nil
}

func (s *IntervalExercisePrescriptionsService) DeleteOne(ctx context.Context, id int64) error {
	return s.PrescriptionRepo.DeleteOne(ctx, id)
}
