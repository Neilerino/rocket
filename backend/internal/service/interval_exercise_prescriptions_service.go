package service

import (
	"backend/db"
	"backend/db/repository"
	"backend/internal/types"
	"backend/internal/utils"
	"context"
	"errors"
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
	ExerciseId     int64
	VariationId    int64
	PlanIntervalId int64
	Rpe            int32
	Sets           int32
	Reps           int32
	Duration       string
	Rest           string
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
		VariationId: variationIds,
	})
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
		prescriptions = append(prescriptions, types.IntervalExercisePrescription{
			ID:                  row.ID,
			GroupId:             row.GroupID,
			ExerciseVariationId: row.ExerciseVariationID,
			PlanIntervalId:      row.PlanIntervalID,
			RPE:                 float64(row.Rpe.Int32),
			Sets:                row.Sets,
			Reps:                row.Reps.Int32,
			Duration:            utils.IntervalToString(row.Duration),
			Rest:                utils.IntervalToString(row.Rest),
			ExerciseVariation:   variationMap[row.ExerciseVariationID],
		})
	}

	return prescriptions, nil
}

func (s *IntervalExercisePrescriptionsService) CreateOne(ctx context.Context, params PrescriptionCreateData) (*types.IntervalExercisePrescription, error) {
	row, err := s.PrescriptionRepo.CreateOne(ctx, repository.PrescriptionCreateData{
		GroupId:        params.GroupId,
		ExerciseId:     params.ExerciseId,
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
