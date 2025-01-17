export function updateKeyedInArray<V, K>(v: V[], keyFinder: (v: V, k: K) => boolean, key: K, update: V) {
    return v.map(previous => keyFinder(previous, key) == keyFinder(update, key) ? update : previous);
}

export function updateIdentifiedInArray<V extends { id: K }, K>(v: V[], update: V) {
    return updateKeyedInArray(v, (val, key) => val.id == key, update.id, update);
}
