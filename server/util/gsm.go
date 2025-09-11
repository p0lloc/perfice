package util

import (
	"iter"
	"sync"
)

// GenericSyncMap is like sync.Map with generic key and value types K and V.
// The zero GenericSyncMap is empty and ready for use.
// A GenericSyncMap must not be copied after first use.
type GenericSyncMap[K comparable, V any] struct {
	syncMap sync.Map
}

// Load returns the value stored in the map for a key, or nil if no
// value is present.
// The ok result indicates whether value was found in the map.
func (gsm *GenericSyncMap[K, V]) Load(
	key K,
) (value V, ok bool) {

	anyValue, ok := gsm.syncMap.Load(key)
	if !ok {
		return
	}

	value = anyValue.(V)

	return
}

// Store sets the value for a key.
func (gsm *GenericSyncMap[K, V]) Store(
	key K,
	value V,
) {

	gsm.syncMap.Store(key, value)
}

// Clear deletes all the entries, resulting in an empty Map.
func (gsm *GenericSyncMap[K, V]) Clear() {
	gsm.syncMap.Clear()
}

// LoadOrStore returns the existing value for the key if present.
// Otherwise, it stores and returns the given value.
// The loaded result is true if the value was loaded, false if stored.
func (gsm *GenericSyncMap[K, V]) LoadOrStore(
	key K,
	value V,
) (actual V, loaded bool) {

	actualAny, loaded := gsm.syncMap.LoadOrStore(key, value)

	if !loaded {
		return
	}

	actual = actualAny.(V)
	return
}

// LoadAndDelete deletes the value for a key, returning the previous value if any.
// The loaded result reports whether the key was present.
func (gsm *GenericSyncMap[K, V]) LoadAndDelete(
	key K,
) (value V, loaded bool) {

	anyValue, loaded := gsm.syncMap.LoadAndDelete(key)

	if !loaded {
		return
	}

	value = anyValue.(V)
	return
}

// Delete deletes the value for a key.
func (gsm *GenericSyncMap[K, V]) Delete(
	key K,
) {
	gsm.syncMap.Delete(key)
}

// Swap swaps the value for a key and returns the previous value if any.
// The loaded result reports whether the key was present.
func (gsm *GenericSyncMap[K, V]) Swap(
	key K,
	value V,
) (previous V, loaded bool) {

	previousAny, loaded := gsm.syncMap.Swap(key, value)

	if !loaded {
		return
	}

	previous = previousAny.(V)
	return
}

// CompareAndSwap swaps the old and new values for key
// if the value stored in the map is equal to old.
// The old value must be of a comparable type.
func (gsm *GenericSyncMap[K, V]) CompareAndSwap(
	key K,
	old V,
	new V,
) (swapped bool) {

	swapped = gsm.syncMap.CompareAndSwap(key, old, new)
	return
}

// CompareAndDelete deletes the entry for key if its value is equal to old.
// The old value must be of a comparable type.
//
// If there is no current value for key in the map, CompareAndDelete
// returns false (even if the old value is the nil interface value).
func (gsm *GenericSyncMap[K, V]) CompareAndDelete(
	key K,
	old V,
) (deleted bool) {

	deleted = gsm.syncMap.CompareAndDelete(key, old)
	return
}

// Range returns an iter.Seq2[K, V] over all entries in the map.
func (gsm *GenericSyncMap[K, V]) Range() iter.Seq2[K, V] {

	return func(yield func(K, V) bool) {

		for anyKey, anyValue := range gsm.syncMap.Range {

			if !yield(
				anyKey.(K),
				anyValue.(V),
			) {
				break
			}
		}
	}
}

func (gsm *GenericSyncMap[K, V]) Keys() iter.Seq[K] {
	return func(yield func(K) bool) {
		for anyKey := range gsm.syncMap.Range {
			if !yield(anyKey.(K)) {
				break
			}
		}
	}
}

func (gsm *GenericSyncMap[K, V]) Values() iter.Seq[V] {
	return func(yield func(V) bool) {
		for _, anyValue := range gsm.syncMap.Range {
			if !yield(anyValue.(V)) {
				break
			}
		}
	}
}
