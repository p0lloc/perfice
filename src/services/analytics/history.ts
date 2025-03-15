import type {CorrelationResult} from "@perfice/services/analytics/analytics";

const HISTORY_STORE_KEY = "correlations_history";

export interface AnalyticsHistoryEntry {
    key: string;
    coefficient: number;
    timestamp: number;
}

export class AnalyticsHistoryService {

    private entries: AnalyticsHistoryEntry[] = [];
    private readonly confidenceThreshold: number;
    private readonly changeThreshold: number;

    constructor(confidenceThreshold: number, changeThreshold: number) {
        this.confidenceThreshold = confidenceThreshold;
        this.changeThreshold = changeThreshold;
    }

    load() {
        let entriesStr = localStorage.getItem(HISTORY_STORE_KEY);
        this.entries = entriesStr ? JSON.parse(entriesStr) : [];
    }

    getHistoryByKey(key: string): AnalyticsHistoryEntry | undefined {
        return this.entries.find(e => e.key == key);
    }

    getNewestCorrelations(limit: number, until: number): AnalyticsHistoryEntry[] {
        return this.entries
            .filter(e => e.timestamp <= until)
            .sort((a, b) => {
                // Mainly sort by timestamp, but if timestamps are the same, sort by coefficient
                if (a.timestamp == b.timestamp) {
                    return Math.abs(b.coefficient) - Math.abs(a.coefficient);
                }

                return b.timestamp - a.timestamp;
            })
            .slice(0, limit);
    }

    processResult(correlations: Map<string, CorrelationResult>, date: Date) {
        let result: AnalyticsHistoryEntry[] = [];
        let newTimestamp = date.getTime();
        for (let [key, correlation] of correlations.entries()) {
            if (Math.abs(correlation.coefficient) < this.confidenceThreshold)
                continue;

            let timestamp: number = newTimestamp;
            let existing = this.getHistoryByKey(key);
            // If the change in coefficient was large, consider it a "new" correlation (i.e don't use previous timestamp)
            if (existing != null && !(Math.abs(existing.coefficient - correlation.coefficient) > this.changeThreshold)) {
                timestamp = existing.timestamp;
            }

            result.push({
                key,
                coefficient: correlation.coefficient,
                timestamp
            });
        }

        localStorage.setItem(HISTORY_STORE_KEY, JSON.stringify(result));
        this.entries = result;
    }
}