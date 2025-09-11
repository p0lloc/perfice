package mongoutil

import "go.mongodb.org/mongo-driver/bson/primitive"

func CleanBSON(v any) any {
	switch val := v.(type) {
	case primitive.D:
		return cleanDocument(val)
	case primitive.M:
		return cleanMap(val)
	case map[string]any:
		return cleanMap(val)
	case primitive.A:
		return cleanArray(val)
	case []any:
		return cleanArray(val)
	case primitive.ObjectID:
		return val.Hex()
	case primitive.DateTime:
		return val.Time()
	default:
		return val
	}
}

func cleanMap(m map[string]any) map[string]any {
	out := make(map[string]any)
	for k, v := range m {
		out[k] = CleanBSON(v)
	}
	return out
}

func cleanDocument(m primitive.D) map[string]any {
	out := make(map[string]any)
	for _, v := range m {
		out[v.Key] = CleanBSON(v.Value)
	}
	return out
}

func cleanArray(arr []any) []any {
	out := make([]any, len(arr))
	for i, v := range arr {
		out[i] = CleanBSON(v)
	}
	return out
}
