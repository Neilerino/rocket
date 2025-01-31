package api_utils

import (
	"errors"
	"strconv"
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
		return -1, err
	}
	return i, nil
}
