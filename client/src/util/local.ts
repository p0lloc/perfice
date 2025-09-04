export function parseJsonFromLocalStorage<T>(key: string): T | null {
    try {
        let raw = localStorage.getItem(key);
        if (raw == null) return null;

        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}