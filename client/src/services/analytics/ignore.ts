import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import {parseJsonFromLocalStorage} from "@perfice/util/local";

const IGNORED_CORRELATIONS_STORE_KEY = "ignored_correlations";

export interface IgnoredCorrelation {
    key: string;
    timeScope: SimpleTimeScopeType;
}

export class CorrelationIgnoreService {

    private ignoredCorrelations: IgnoredCorrelation[] = [];

    load() {
        this.ignoredCorrelations = parseJsonFromLocalStorage(IGNORED_CORRELATIONS_STORE_KEY) ?? [];
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

    getIgnoredCorrelations(): IgnoredCorrelation[] {
        return this.ignoredCorrelations;
    }

    importIgnoredCorrelations(data: IgnoredCorrelation[]) {
        this.ignoredCorrelations = data;
        this.save();
    }

    private save() {
        localStorage.setItem(IGNORED_CORRELATIONS_STORE_KEY, JSON.stringify(this.ignoredCorrelations));
    }

}
