export interface Identified<T> {
    id: T
}

export function updateKeyedInArray<V, K>(v: V[], keyFinder: (v: V, k: K) => boolean, key: K, update: V) {
    return v.map(previous => keyFinder(previous, key) == keyFinder(update, key) ? update : previous);
}

export function updateIdentifiedInArray<V extends Identified<K>, K>(v: V[], update: V) {
    return updateKeyedInArray(v, (val, key) => val.id == key, update.id, update);
}

export function deleteIdentifiedInArray<V extends Identified<K>, K>(v: V[], id: K): V[] {
    return v.filter(val => val.id != id);
}

export function updateIndexInArray<V>(v: V[], index: number, update: V) {
    return v.map((val, i) => i == index ? update : val);
}

export function findArrayDifferences<T>(originalList: T[], updatedList: T[]) {
    const added = updatedList.filter(item => !originalList.includes(item));
    const removed = originalList.filter(item => !updatedList.includes(item));

    return {added, removed};
}

export function reorderGeneric<T extends { order: number }>(items: T[]): T[] {
    let values: T[] = [];
    for (let i = 0; i < items.length; i++) {
        values.push({...items[i], order: i});
    }

    return values;
}
