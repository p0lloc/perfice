import type {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import type {AnalyticsService, CorrelationResult} from "@perfice/services/analytics/analytics";
import type {Form} from "@perfice/model/form/form";
import type { FormStore } from "../form/form";

export class AnalyticsStore {
    private readonly analyticsService: AnalyticsService;
    private readonly formStore: FormStore;

    constructor(analyticsService: AnalyticsService, formStore: FormStore) {
        this.analyticsService = analyticsService;
        this.formStore = formStore;
    }

    async runBasicCorrelations(date: Date, range: number, minimumSampleSize: number): Promise<[Form[], Map<string, CorrelationResult>]> {
        let forms = await this.formStore.get();
        return [forms, await this.analyticsService.runBasicCorrelations(date, range, minimumSampleSize)];
    }

    async fetchAnalytics(timeScope: SimpleTimeScopeType, range: number) {
        return this.analyticsService.fetchRawValues(timeScope, range);
    }
}