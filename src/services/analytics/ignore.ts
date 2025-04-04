import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";

const IGNORED_CORRELATIONS_STORE_KEY = "ignored_correlations";

export interface IgnoredCorrelation {
    key: string;
    timeScope: SimpleTimeScopeType;
}

export class CorrelationIgnoreService {

    private ignoredCorrelations: IgnoredCorrelation[] = [];

    load() {
        let entriesStr = localStorage.getItem(IGNORED_CORRELATIONS_STORE_KEY);
        this.ignoredCorrelations = entriesStr ? JSON.parse(entriesStr) : [];
    }

    groupIgnoresByTimeScope(): Record<SimpleTimeScopeType, string[]> {
        let result: Record<SimpleTimeScopeType, string[]> = {
            [SimpleTimeScopeType.DAILY]: [],
            [SimpleTimeScopeType.WEEKLY]: [],
            [SimpleTimeScopeType.MONTHLY]: [],
            [SimpleTimeScopeType.YEARLY]: [],
        }

        for (let ignored of this.ignoredCorrelations) {
            result[ignored.timeScope].push(ignored.key);
        }

        return result;
    }

    ignoreCorrelation(correlation: IgnoredCorrelation) {
        this.ignoredCorrelations.push(correlation);
        this.save();
    }

    private save() {
        localStorage.setItem(IGNORED_CORRELATIONS_STORE_KEY, JSON.stringify(this.ignoredCorrelations));
    }

}
