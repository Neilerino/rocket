package api_utils

import (
	"errors"
	"strconv"
	"log"
)

func isEmpty(v string) bool {
	return !(len(v) > 0)
}

func ParseBigInt(s string) (int64, error) {
	if isEmpty(s) {
		return -1, errors.New("empty string")
	}

	i, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		log.Printf("Error parsing int64 value '%s': %v", s, err)
		return -1, err
	}
	return i, nil
}

// ParseInt32 parses a string to an int32
func ParseInt32(s string) (int32, error) {
	if isEmpty(s) {
		return -1, errors.New("empty string")
	}

	i, err := strconv.ParseInt(s, 10, 32)
	if err != nil {
		log.Printf("Error parsing int32 value '%s': %v", s, err)
		return -1, err
	}
	return int32(i), nil
}
