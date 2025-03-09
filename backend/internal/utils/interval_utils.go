package utils

import (
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"
)

// IntervalToString converts a pgtype.Interval to a user-friendly string format
// For durations less than 2 weeks, it returns "X days"
// For durations of 2 weeks or more, it returns "X weeks" or "X weeks, Y days"
func IntervalToString(interval pgtype.Interval) string {
	// For user-friendly format, convert to weeks and days
	totalDays := interval.Days

	// Convert months to approximate days (assuming 30 days per month)
	if interval.Months != 0 {
		totalDays += interval.Months * 30
	}

	// If we have microseconds but no days or months, return technical format
	if totalDays == 0 && interval.Microseconds != 0 {
		return fmt.Sprintf("%du", interval.Microseconds)
	}

	// If less than 2 weeks, show as days
	if totalDays > 0 && totalDays < 14 {
		if totalDays == 1 {
			return "1 day"
		}
		return fmt.Sprintf("%d days", totalDays)
	}

	// Show as weeks if it's an exact number of weeks or more than 2 weeks
	if totalDays >= 14 {
		weeks := totalDays / 7
		remainingDays := totalDays % 7

		if remainingDays == 0 {
			// Exact number of weeks
			if weeks == 1 {
				return "1 week"
			}
			return fmt.Sprintf("%d weeks", weeks)
		} else {
			// Weeks plus days
			weekText := "weeks"
			if weeks == 1 {
				weekText = "week"
			}

			dayText := "days"
			if remainingDays == 1 {
				dayText = "day"
			}

			return fmt.Sprintf("%d %s, %d %s", weeks, weekText, remainingDays, dayText)
		}
	}

	// Fallback to technical format for complex intervals
	var result string
	if interval.Months != 0 {
		result += fmt.Sprint(interval.Months) + "M"
	}
	if interval.Days != 0 {
		result += fmt.Sprint(interval.Days) + "D"
	}
	if interval.Microseconds != 0 {
		result += fmt.Sprint(interval.Microseconds) + "u"
	}

	// If no components were added, return a default value
	if result == "" {
		return "0 days"
	}

	return result
}
