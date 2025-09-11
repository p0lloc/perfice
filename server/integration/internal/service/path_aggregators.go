package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/PaesslerAG/jsonpath"
)

type AggregatePath interface {
	Evaluate(args any, data any, now time.Time) (any, error)
}

type SumAggregatePath struct{}

func fetchArray(args any, data interface{}) ([]interface{}, error) {
	if arg, ok := args.(string); ok {
		value, err := jsonpath.Get(arg, data)
		if err != nil {
			return nil, err
		}

		if items, ok := value.([]interface{}); ok {
			return items, nil
		}
	}

	return []interface{}{}, nil
}

func (s *SumAggregatePath) Evaluate(args any, data any, now time.Time) (any, error) {
	var total float64

	items, err := fetchArray(args, data)
	if err != nil {
		return nil, err
	}

	for _, item := range items {
		if num, ok := item.(float64); ok {
			total += num
		}
	}

	return total, nil
}

type DivAggregatePath struct{}

func (m *DivAggregatePath) Evaluate(args any, data any, now time.Time) (any, error) {
	if arg, ok := args.([]any); ok {
		if len(arg) != 2 {
			return nil, nil
		}

		if path, ok := arg[0].(string); ok {
			if divisor, ok := arg[1].(float64); ok {
				if divisor == 0 {
					return 0, nil
				}

				value, err := jsonpath.Get(path, data)
				if err != nil {
					return nil, err
				}

				if num, ok := value.(float64); ok {
					return num / divisor, nil
				}
			}
		}
	}

	return nil, nil
}

type MeanAggregatePath struct{}

func (m *MeanAggregatePath) Evaluate(args any, data any, now time.Time) (any, error) {
	var total float64
	var count int

	items, err := fetchArray(args, data)
	if err != nil {
		return nil, err
	}

	if len(items) < 1 {
		return 0, nil
	}

	for _, item := range items {
		if num, ok := item.(float64); ok {
			total += num
			count += 1
		}
	}

	return total / float64(count), nil
}

type LenAggregatePath struct{}

func (l *LenAggregatePath) Evaluate(args any, data any, now time.Time) (any, error) {
	items, err := fetchArray(args, data)
	if err != nil {
		return nil, err
	}

	return len(items), nil
}

type CurrentTimePath struct{}

func (c *CurrentTimePath) Evaluate(_ any, _ any, now time.Time) (any, error) {
	return now.UnixMilli(), nil
}

type DateAggregatePath struct{}

func evaluateDatePath(args any, data any, layout string, now time.Time) (any, error) {
	if arg, ok := args.(string); ok {
		value, err := jsonpath.Get(arg, data)
		if err != nil {
			return nil, err
		}

		if str, ok := value.(string); ok {
			t, err := time.ParseInLocation(layout, str, now.Location())
			if err != nil {
				return nil, err
			}

			return t.UnixMilli(), nil
		}
	}

	return nil, nil
}

func (d *DateAggregatePath) Evaluate(args any, data any, now time.Time) (any, error) {
	return evaluateDatePath(args, data, time.DateOnly, now)
}

type DateTimeAggregatePath struct{}

func (d *DateTimeAggregatePath) Evaluate(args any, data any, now time.Time) (any, error) {
	return evaluateDatePath(args, data, time.RFC3339, now)
}

type DateTimeNoTZAggregatePath struct{}

func (d *DateTimeNoTZAggregatePath) Evaluate(args any, data any, now time.Time) (any, error) {
	return evaluateDatePath(args, data, "2006-01-02T15:04:05.000", now)
}

type DateTimeMergeAggregatePath struct{}

func (d *DateTimeMergeAggregatePath) Evaluate(args any, data any, now time.Time) (any, error) {
	if arg, ok := args.([]any); ok {
		if len(arg) != 2 {
			return nil, nil
		}

		if datePath, ok := arg[0].(string); ok {
			if timePath, ok := arg[1].(string); ok {
				dateValue, err := get[string](datePath, data)
				if err != nil {
					return nil, err
				}

				timeValue, err := get[string](timePath, data)
				if err != nil {
					return nil, err
				}

				t, err := time.ParseInLocation("2006-01-02 15:04", fmt.Sprintf("%s %s", dateValue, timeValue), now.Location())
				if err != nil {
					return nil, err
				}

				return t.UnixMilli(), nil
			}
		}
	}

	return nil, nil
}

func get[T any](path string, data any) (T, error) {
	value, err := jsonpath.Get(path, data)
	if err != nil {
		var zero T
		return zero, err
	}

	if val, ok := value.(T); ok {
		return val, nil
	} else {
		var zero T
		return zero, errors.New("failed to convert value")
	}
}
