package utils

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"
)

func StringToInterval(timeStr string) (pgtype.Interval, error) {
	interval := pgtype.Interval{}

	// Initialize with zero values
	var weeks, days, hours, minutes, seconds int

	// Use regex to extract time components
	weekRegex := regexp.MustCompile(`(\d+)\s*weeks?`)
	dayRegex := regexp.MustCompile(`(\d+)\s*days?`)
	hourRegex := regexp.MustCompile(`(\d+)\s*hours?`)
	minRegex := regexp.MustCompile(`(\d+)\s*minutes?`)
	secRegex := regexp.MustCompile(`(\d+)\s*seconds?`)

	// Extract weeks
	weekMatches := weekRegex.FindStringSubmatch(timeStr)
	if len(weekMatches) > 1 {
		wk, err := strconv.Atoi(weekMatches[1])
		if err != nil {
			return interval, fmt.Errorf("failed to parse weeks: %w", err)
		}
		weeks = wk
	}

	// Extract days
	dayMatches := dayRegex.FindStringSubmatch(timeStr)
	if len(dayMatches) > 1 {
		d, err := strconv.Atoi(dayMatches[1])
		if err != nil {
			return interval, fmt.Errorf("failed to parse days: %w", err)
		}
		days = d
	}

	// Extract hours
	hourMatches := hourRegex.FindStringSubmatch(timeStr)
	if len(hourMatches) > 1 {
		hr, err := strconv.Atoi(hourMatches[1])
		if err != nil {
			return interval, fmt.Errorf("failed to parse hours: %w", err)
		}
		hours = hr
	}

	// Extract minutes
	minMatches := minRegex.FindStringSubmatch(timeStr)
	if len(minMatches) > 1 {
		min, err := strconv.Atoi(minMatches[1])
		if err != nil {
			return interval, fmt.Errorf("failed to parse minutes: %w", err)
		}
		minutes = min
	}

	// Extract seconds
	secMatches := secRegex.FindStringSubmatch(timeStr)
	if len(secMatches) > 1 {
		sec, err := strconv.Atoi(secMatches[1])
		if err != nil {
			return interval, fmt.Errorf("failed to parse seconds: %w", err)
		}
		seconds = sec
	}

	// If no valid time components were found
	if len(weekMatches) <= 1 && len(dayMatches) <= 1 && len(hourMatches) <= 1 &&
		len(minMatches) <= 1 && len(secMatches) <= 1 {
		return interval, fmt.Errorf("invalid time format, expected combination of weeks, days, hours, minutes, seconds")
	}

	// Convert to microseconds for pgtype.Interval
	// 1 week = 7 days = 604,800 seconds = 604,800,000,000 microseconds
	// 1 day = 24 hours = 86,400 seconds = 86,400,000,000 microseconds
	// 1 hour = 60 minutes = 3,600 seconds = 3,600,000,000 microseconds
	// 1 minute = 60 seconds = 60,000,000 microseconds
	// 1 second = 1,000,000 microseconds
	microseconds := int64(weeks)*7*24*60*60*1000000 +
		int64(days)*24*60*60*1000000 +
		int64(hours)*60*60*1000000 +
		int64(minutes)*60*1000000 +
		int64(seconds)*1000000

	// Set the interval fields
	// For week/day values, store in Days field if they exist
	if weeks > 0 || days > 0 {
		interval.Days = int32(weeks*7 + days)
		// Only store hours, minutes, seconds in Microseconds
		microseconds = int64(hours)*60*60*1000000 +
			int64(minutes)*60*1000000 +
			int64(seconds)*1000000
	}

	interval.Microseconds = microseconds
	interval.Valid = true

	return interval, nil
}

// IntervalToString converts a pgtype.Interval to a human-readable string
func IntervalToString(interval pgtype.Interval) (string, error) {
	if !interval.Valid {
		return "", fmt.Errorf("interval is not valid")
	}

	// Consider both Microseconds and Days/Months fields
	// Convert Days to microseconds and add to total
	dayMicroseconds := int64(interval.Days) * 24 * 60 * 60 * 1000000
	monthMicroseconds := int64(interval.Months) * 30 * 24 * 60 * 60 * 1000000 // Approximation

	// Get total microseconds
	totalMicroseconds := interval.Microseconds + dayMicroseconds + monthMicroseconds

	// Handle negative intervals
	negative := false
	if totalMicroseconds < 0 {
		negative = true
		totalMicroseconds = -totalMicroseconds
	}

	// Constants for conversion
	const (
		microsecondsPerSecond = 1000000
		secondsPerMinute      = 60
		minutesPerHour        = 60
		hoursPerDay           = 24
		daysPerWeek           = 7
	)

	// Convert to weeks, days, hours, minutes, and seconds
	seconds := totalMicroseconds / microsecondsPerSecond
	minutes := seconds / secondsPerMinute
	hours := minutes / minutesPerHour
	days := hours / hoursPerDay
	weeks := days / daysPerWeek

	// Calculate remainders
	days %= daysPerWeek
	hours %= hoursPerDay
	minutes %= minutesPerHour
	seconds %= secondsPerMinute

	// Build the output string
	var result strings.Builder

	if negative {
		result.WriteString("-")
	}

	// Helper function to append a time unit with proper singular/plural form
	appendTimeUnit := func(value int64, singular, plural string, isFirst *bool) {
		if value > 0 {
			if !*isFirst {
				result.WriteString(" ")
			}
			*isFirst = false

			if value == 1 {
				result.WriteString(fmt.Sprintf("%d %s", value, singular))
			} else {
				result.WriteString(fmt.Sprintf("%d %s", value, plural))
			}
		}
	}

	// Track if we've added any component yet
	isFirst := true

	// Add all time components if they are > 0
	appendTimeUnit(weeks, "week", "weeks", &isFirst)
	appendTimeUnit(days, "day", "days", &isFirst)
	appendTimeUnit(hours, "hour", "hours", &isFirst)
	appendTimeUnit(minutes, "minute", "minutes", &isFirst)
	appendTimeUnit(seconds, "second", "seconds", &isFirst)

	// Handle special case where all components are zero
	if isFirst {
		result.WriteString("0 seconds")
	}

	return result.String(), nil
}
