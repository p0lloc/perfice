package util

func GetFromMapOrNil[K comparable, R any](mapping map[K]R, key K) *R {
	if val, ok := mapping[key]; ok {
		return &val
	}

	return nil
}

func GetFromMapOrDefault[K comparable, R any](mapping map[K]R, key K, defaultValue R) *R {
	if val, ok := mapping[key]; ok {
		return &val
	}

	return &defaultValue
}

func SliceMap[T any, R any](slice []T, mapper func(val T) R) []R {
	mapped, _ := SliceMapErr[T, R](slice, func(val T) (R, error) {
		return mapper(val), nil
	})

	return mapped
}

func SliceMapErr[T any, R any](slice []T, mapper func(val T) (R, error)) ([]R, error) {
	var result = make([]R, len(slice))
	for i, v := range slice {
		val, err := mapper(v)
		if err != nil {
			return nil, err
		}
		result[i] = val
	}

	return result, nil
}
