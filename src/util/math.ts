export function calculateProgressSafe(first: number, total: number): number {
    if (total == 0) return 0;

    return first / total;
}
