package repository

import (
	"backend/db"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"
)

type PlanIntervalsRepository struct {
	Queries *db.Queries
}


func (r *PlanIntervalsRepository) ListPlanIntervals(ctx context.Context, planId int64, intervalId int64, limit int32) ([]db.PlanInterval, error) {
	// Convert boolean conditions to integers (0 or 1)
	var usePlanIdFilter, useIntervalIdFilter int32
	if planId != 0 {
		usePlanIdFilter = 1
	}
	if intervalId != 0 {
		useIntervalIdFilter = 1
	}

	plan_intervals, err := r.Queries.PlanIntervals_List(ctx, db.PlanIntervals_ListParams{
		PlanID: planId,
		Column2: usePlanIdFilter, // Use plan_id filter if non-zero (1 = true, 0 = false)
		ID: intervalId,
		Column4: useIntervalIdFilter, // Use interval_id filter if non-zero (1 = true, 0 = false)
		Limit: limit,
	})
	if err != nil {
		return nil, err
	}
	return plan_intervals, nil
}

func stringToInterval(duration string) (pgtype.Interval, error) {
	// Parse the duration string into months, days, and microseconds
	// The duration string should be in the format "1M2D3u"
	var months, days, microseconds int
	_, err := fmt.Sscanf(duration, "%dM%dD%du", &months, &days, &microseconds)
	if err != nil {
		return pgtype.Interval{}, err
	}
	return pgtype.Interval{Months: int32(months), Days: int32(days), Microseconds: int64(microseconds)}, nil
}

func (r *PlanIntervalsRepository) CreatePlanInterval(ctx context.Context, planId int64, duration string, name string, order int32, description string) (*db.PlanInterval, error) {
	plan_intervals, err := r.ListPlanIntervals(ctx, planId, 0, 100)
	if err != nil {
		return nil, err
	}

	plan_interval_updates := db.PlanIntervals_UpdateOrderByValuesParams{
		IntervalIds: make([]int64, 0),
		NewOrders:   make([]int32, 0),
	}

	for _, plan_interval := range plan_intervals {
		if plan_interval.Order >= order {
			plan_interval_updates.IntervalIds = append(plan_interval_updates.IntervalIds, plan_interval.ID)
			plan_interval_updates.NewOrders = append(plan_interval_updates.NewOrders, plan_interval.Order+1)
		}
	}

	_, err = r.Queries.PlanIntervals_UpdateOrderByValues(ctx, plan_interval_updates)
	if err != nil {
		return nil, err
	}

	pg_duration, err := stringToInterval(duration)
	if err != nil {
		return nil, err
	}

	plan_interval, err := r.Queries.PlanIntervals_CreateOne(ctx, db.PlanIntervals_CreateOneParams{PlanID: planId, Duration: pg_duration, Name: pgtype.Text{String: name, Valid: true}, Order: order, Description: pgtype.Text{String: description, Valid: true}})
	if err != nil {
		return nil, err
	}
	return &plan_interval, nil
}

func (r *PlanIntervalsRepository) DeletePlanInterval(ctx context.Context, id int64) (*db.PlanInterval, error) {
	plan_interval, err := r.Queries.PlanIntervals_DeleteById(ctx, id)
	if err != nil {
		return nil, err
	}
	return &plan_interval, nil
}