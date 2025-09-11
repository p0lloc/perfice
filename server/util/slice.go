package util

func CastSlice[T any](slice []any) []T {
	var casted []T
	for _, item := range slice {
		casted = append(casted, item.(T))
	}

	return casted
}

func SliceFilter[T any](slice []T, predicate func(val T) bool) []T {
	var result = make([]T, 0)
	for _, v := range slice {
		if predicate(v) {
			result = append(result, v)
		}
	}

	return result
}

func SliceFind[T any](slice []T, predicate func(val T) bool) *T {
	for _, v := range slice {
		if predicate(v) {
			return &v
		}
	}

	return nil
}

func SliceContains[T comparable](slice []T, item T) bool {
	for _, v := range slice {
		if v == item {
			return true
		}
	}
	return false
}
