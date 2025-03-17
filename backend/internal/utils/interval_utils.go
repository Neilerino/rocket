package utils

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"

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

func StringToInterval(duration string) (pgtype.Interval, error) {
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
