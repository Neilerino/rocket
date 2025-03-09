package repository

import (
	"backend/db"
	"context"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"
)

type PlanIntervalsRepository struct {
	Queries *db.Queries
}

func (r *PlanIntervalsRepository) ListPlanIntervals(ctx context.Context, planId int64, intervalId int64, limit int32) ([]db.PlanIntervals_ListRow, error) {
	// Convert boolean conditions to integers (0 or 1)
	var usePlanIdFilter, useIntervalIdFilter int32
	if planId != 0 {
		usePlanIdFilter = 1
	}
	if intervalId != 0 {
		useIntervalIdFilter = 1
	}

	plan_intervals, err := r.Queries.PlanIntervals_List(ctx, db.PlanIntervals_ListParams{
		PlanID:  planId,
		Column2: usePlanIdFilter, // Use plan_id filter if non-zero (1 = true, 0 = false)
		ID:      intervalId,
		Column4: useIntervalIdFilter, // Use interval_id filter if non-zero (1 = true, 0 = false)
		Limit:   limit,
	})
	if err != nil {
		return nil, err
	}
	return plan_intervals, nil
}

func stringToInterval(duration string) (pgtype.Interval, error) {
	// Initialize variables for all time units
	var months, weeks, days int32
	var microseconds int64

	// Handle more flexible formats including natural language descriptions
	// First, convert to lowercase and remove any extra spaces
	duration = strings.ToLower(strings.TrimSpace(duration))

	// Check for natural language format like "7 days" or "2 weeks"
	if strings.Contains(duration, " ") {
		parts := strings.Fields(duration)
		if len(parts) >= 2 {
			// Try to parse the numeric part
			value, err := strconv.Atoi(parts[0])
			if err != nil {
				return pgtype.Interval{}, fmt.Errorf("invalid duration format: %s", duration)
			}

			// Determine the unit
			unit := parts[1]
			// Handle both singular and plural forms
			if strings.HasSuffix(unit, "s") && len(unit) > 1 {
				unit = unit[:len(unit)-1]
			}

			switch unit {
			case "month", "months":
				months = int32(value)
			case "week", "weeks":
				weeks = int32(value)
			case "day", "days":
				days = int32(value)
			default:
				return pgtype.Interval{}, fmt.Errorf("unsupported time unit: %s", unit)
			}
		}
	} else {
		// Try to parse the technical format like "1M2W3D4u"
		// Extract months (M)
		monthsRegex := regexp.MustCompile(`(\d+)M`)
		if matches := monthsRegex.FindStringSubmatch(duration); len(matches) > 1 {
			if value, err := strconv.Atoi(matches[1]); err == nil {
				months = int32(value)
			}
		}

		// Extract weeks (W)
		weeksRegex := regexp.MustCompile(`(\d+)W`)
		if matches := weeksRegex.FindStringSubmatch(duration); len(matches) > 1 {
			if value, err := strconv.Atoi(matches[1]); err == nil {
				weeks = int32(value)
			}
		}

		// Extract days (D)
		daysRegex := regexp.MustCompile(`(\d+)D`)
		if matches := daysRegex.FindStringSubmatch(duration); len(matches) > 1 {
			if value, err := strconv.Atoi(matches[1]); err == nil {
				days = int32(value)
			}
		}

		// Extract microseconds (u)
		microsecondsRegex := regexp.MustCompile(`(\d+)u`)
		if matches := microsecondsRegex.FindStringSubmatch(duration); len(matches) > 1 {
			if value, err := strconv.Atoi(matches[1]); err == nil {
				microseconds = int64(value)
			}
		}
	}

	// Convert weeks to days (1 week = 7 days)
	days += weeks * 7

	// If no valid duration was parsed, return an error
	if months == 0 && days == 0 && microseconds == 0 {
		return pgtype.Interval{}, fmt.Errorf("could not parse duration: %s", duration)
	}

	// Create a properly initialized pgtype.Interval
	interval := pgtype.Interval{
		Months:       months,
		Days:         days,
		Microseconds: microseconds,
		Valid:        true,
	}

	fmt.Printf("Parsed duration '%s' into interval: %+v\n", duration, interval)
	return interval, nil
}

func (r *PlanIntervalsRepository) CreatePlanInterval(ctx context.Context, planId int64, duration string, name string, order int32, description string) (*db.PlanInterval, error) {
	plan_intervals, err := r.ListPlanIntervals(ctx, planId, 0, 100)
	if err != nil {
		return nil, err
	}

	if len(plan_intervals) > 0 {
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
	}

	// Log the input duration for debugging
	fmt.Printf("Creating plan interval with duration string: '%s'\n", duration)

	// Parse the duration string to interval
	pg_duration, err := stringToInterval(duration)
	if err != nil {
		fmt.Printf("Error parsing duration: %v\n", err)
		return nil, err
	}

	// Log the interval for debugging
	fmt.Printf("Using interval: %+v\n", pg_duration)

	// Create params with properly initialized fields
	createParams := db.PlanIntervals_CreateOneParams{
		PlanID:      planId,
		Duration:    pg_duration,
		Name:        pgtype.Text{String: name, Valid: true},
		Order:       order,
		Description: pgtype.Text{String: description, Valid: true},
	}

	// Log the params for debugging
	fmt.Printf("Creating plan interval with params: %+v\n", createParams)

	// Create the plan interval
	plan_interval, err := r.Queries.PlanIntervals_CreateOne(ctx, createParams)
	if err != nil {
		fmt.Printf("Error creating plan interval: %v\n", err)
		return nil, err
	}

	fmt.Printf("Successfully created plan interval with ID: %d\n", plan_interval.ID)
	return &plan_interval, nil
}

func (r *PlanIntervalsRepository) DeletePlanInterval(ctx context.Context, id int64) (*db.PlanInterval, error) {
	plan_interval, err := r.Queries.PlanIntervals_DeleteById(ctx, id)
	if err != nil {
		return nil, err
	}
	return &plan_interval, nil
}
