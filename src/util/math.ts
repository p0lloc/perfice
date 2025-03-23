export function calculateProgressSafe(first: number, total: number): number {
    if (total == 0) return 0;

    return first / total;
}

export function numberToMaxDecimals(value: number, decimals: number): string {
    return Number.isInteger(value) ? value.toString() : value.toFixed(decimals)
}