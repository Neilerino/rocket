package types

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

// PostgreSQLInterval wraps pgtype.Interval and provides custom JSON marshaling
// to ISO 8601 duration format (PT1H30M45S) for frontend datetime library compatibility
type PostgreSQLInterval struct {
	pgtype.Interval
}

// NewPostgreSQLInterval creates a new PostgreSQLInterval from a pgtype.Interval
func NewPostgreSQLInterval(interval pgtype.Interval) PostgreSQLInterval {
	return PostgreSQLInterval{Interval: interval}
}

// String returns the ISO 8601 string representation of the interval
func (pi PostgreSQLInterval) String() string {
	if !pi.Valid {
		return ""
	}
	json, err := pi.MarshalJSON()
	if err != nil {
		return ""
	}
	// Remove the quotes from the JSON string
	jsonStr := string(json)
	if len(jsonStr) >= 2 && jsonStr[0] == '"' && jsonStr[len(jsonStr)-1] == '"' {
		return jsonStr[1 : len(jsonStr)-1]
	}
	return jsonStr
}

// MarshalJSON converts the interval to ISO 8601 duration format
func (pi PostgreSQLInterval) MarshalJSON() ([]byte, error) {
	if !pi.Valid {
		return json.Marshal(nil)
	}

	// Convert PostgreSQL interval to Go duration
	duration := time.Duration(pi.Microseconds) * time.Microsecond
	duration += time.Duration(pi.Days) * 24 * time.Hour
	duration += time.Duration(pi.Months) * 30 * 24 * time.Hour // Approximate months as 30 days

	// Convert to ISO 8601 duration format
	iso8601 := formatDurationToISO8601(duration)
	return json.Marshal(iso8601)
}

// UnmarshalJSON parses ISO 8601 duration format back to PostgreSQLInterval
func (pi *PostgreSQLInterval) UnmarshalJSON(data []byte) error {
	var iso8601 *string
	if err := json.Unmarshal(data, &iso8601); err != nil {
		return err
	}

	if iso8601 == nil {
		pi.Valid = false
		return nil
	}

	// Parse ISO 8601 duration format
	duration, err := parseISO8601Duration(*iso8601)
	if err != nil {
		return err
	}

	// Convert Go duration back to pgtype.Interval
	pi.Microseconds = int64(duration / time.Microsecond)
	pi.Days = 0    // We'll store everything as microseconds for simplicity
	pi.Months = 0
	pi.Valid = true

	return nil
}

// formatDurationToISO8601 converts a Go time.Duration to ISO 8601 duration format
// Examples: PT1H30M45S, PT30M, PT45S, PT1H
func formatDurationToISO8601(d time.Duration) string {
	if d == 0 {
		return "PT0S"
	}

	result := "PT"
	
	hours := int(d.Hours())
	if hours > 0 {
		result += fmt.Sprintf("%dH", hours)
		d -= time.Duration(hours) * time.Hour
	}
	
	minutes := int(d.Minutes())
	if minutes > 0 {
		result += fmt.Sprintf("%dM", minutes)
		d -= time.Duration(minutes) * time.Minute
	}
	
	seconds := int(d.Seconds())
	if seconds > 0 {
		result += fmt.Sprintf("%dS", seconds)
	}
	
	// If we only had sub-second precision, still show 0S
	if result == "PT" {
		result = "PT0S"
	}
	
	return result
}

// parseISO8601Duration parses an ISO 8601 duration string to Go time.Duration
// Examples: PT1H30M45S, PT30M, PT45S, PT1H
func parseISO8601Duration(iso8601 string) (time.Duration, error) {
	if iso8601 == "" || iso8601 == "PT0S" {
		return 0, nil
	}

	if len(iso8601) < 3 || iso8601[:2] != "PT" {
		return 0, fmt.Errorf("invalid ISO 8601 duration format: %s", iso8601)
	}

	var duration time.Duration
	remaining := iso8601[2:] // Remove "PT" prefix
	
	// Parse hours
	if idx := findUnit(remaining, 'H'); idx != -1 {
		hours, err := parseUnit(remaining[:idx])
		if err != nil {
			return 0, fmt.Errorf("invalid hours in duration %s: %v", iso8601, err)
		}
		duration += time.Duration(hours) * time.Hour
		remaining = remaining[idx+1:]
	}
	
	// Parse minutes
	if idx := findUnit(remaining, 'M'); idx != -1 {
		minutes, err := parseUnit(remaining[:idx])
		if err != nil {
			return 0, fmt.Errorf("invalid minutes in duration %s: %v", iso8601, err)
		}
		duration += time.Duration(minutes) * time.Minute
		remaining = remaining[idx+1:]
	}
	
	// Parse seconds
	if idx := findUnit(remaining, 'S'); idx != -1 {
		seconds, err := parseUnit(remaining[:idx])
		if err != nil {
			return 0, fmt.Errorf("invalid seconds in duration %s: %v", iso8601, err)
		}
		duration += time.Duration(seconds) * time.Second
	}
	
	return duration, nil
}

// findUnit finds the index of a unit character in the string
func findUnit(s string, unit rune) int {
	for i, r := range s {
		if r == unit {
			return i
		}
	}
	return -1
}

// parseUnit parses a numeric value from a string
func parseUnit(s string) (int, error) {
	if s == "" {
		return 0, nil
	}
	var value int
	_, err := fmt.Sscanf(s, "%d", &value)
	return value, err
}