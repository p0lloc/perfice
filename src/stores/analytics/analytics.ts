import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import type {
    AnalyticsService,
    BasicAnalytics,
    CorrelationResult,
    RawAnalyticsValues,
    TagAnalyticsValues
} from "@perfice/services/analytics/analytics";
import type {Form} from "@perfice/model/form/form";
import {AsyncStore} from "@perfice/stores/store";
import type {Tag} from "@perfice/model/tag/tag";
import {convertResultKey, type CorrelationDisplay} from "@perfice/services/analytics/display";
import type {AnalyticsSettingsService} from "@perfice/services/analytics/settings";
import type {AnalyticsHistoryEntry, AnalyticsHistoryService} from "@perfice/services/analytics/history";
import type {AnalyticsSettings} from "@perfice/model/analytics/analytics";
import type {CorrelationIgnoreService} from "@perfice/services/analytics/ignore";

export interface AnalyticsResult {
    correlations: Map<SimpleTimeScopeType, Map<string, CorrelationResult>>;
    forms: Form[];
    tags: Tag[];
    rawValues: Map<SimpleTimeScopeType, RawAnalyticsValues>;
    basicAnalytics: Map<SimpleTimeScopeType, Map<string, Map<string, BasicAnalytics>>>;
    tagValues: TagAnalyticsValues;
    allSettings: AnalyticsSettings[];

    range: number;
    date: Date;
}


async function fetchAnalytics(analyticsService: AnalyticsService, settingsService: AnalyticsSettingsService,
                              historyService: AnalyticsHistoryService | null, ignoreService: CorrelationIgnoreService,
                              date: Date, range: number, minimumSampleSize: number): Promise<AnalyticsResult> {

    let allSettings = await settingsService.getAllSettings();
    let [forms, entries] = await analyticsService.fetchFormsAndEntries(date, range);

    let ignores = ignoreService.groupIgnoresByTimeScope();

    let [dailyValues, interpolated] = await analyticsService.constructRawValues(forms, entries, SimpleTimeScopeType.DAILY, allSettings);
    analyticsService.interpolateValues(dailyValues, interpolated, SimpleTimeScopeType.DAILY, date, range);

    let [tagValues, tags] = await analyticsService.fetchTagValues(SimpleTimeScopeType.DAILY, date, 7 * 14);
    let dailyBasicAnalytics = await analyticsService.calculateAllBasicAnalytics(dailyValues, allSettings);
    let dailyCorrelations = await analyticsService.runBasicCorrelations(dailyValues, tagValues, allSettings, date, range, minimumSampleSize, true);

    ignores[SimpleTimeScopeType.DAILY].forEach(key => dailyCorrelations.delete(key));

    if (historyService != null) {
        historyService.processResult(dailyCorrelations, date);
    }

    let [weeklyValues] = await analyticsService.constructRawValues(forms, entries, SimpleTimeScopeType.WEEKLY);
    let weeklyBasicAnalytics = await analyticsService.calculateAllBasicAnalytics(weeklyValues, allSettings);
    // We don't use week days or tag values for weekly correlations, only numerical/categorical
    let weeklyCorrelations = await analyticsService.runBasicCorrelations(weeklyValues, new Map(), allSettings, date, range, minimumSampleSize, false);

    ignores[SimpleTimeScopeType.WEEKLY].forEach(key => weeklyCorrelations.delete(key));

    let [monthlyValues] = await analyticsService.constructRawValues(forms, entries, SimpleTimeScopeType.MONTHLY);
    let monthlyBasicAnalytics = await analyticsService.calculateAllBasicAnalytics(monthlyValues, allSettings);

    return {
        correlations: new Map([
            [SimpleTimeScopeType.DAILY, dailyCorrelations],
            [SimpleTimeScopeType.WEEKLY, weeklyCorrelations],
        ]),
        forms,
        basicAnalytics: new Map([
            [SimpleTimeScopeType.DAILY, dailyBasicAnalytics],
            [SimpleTimeScopeType.WEEKLY, weeklyBasicAnalytics],
            [SimpleTimeScopeType.MONTHLY, monthlyBasicAnalytics],
        ]),
        rawValues: new Map([
            [SimpleTimeScopeType.DAILY, dailyValues],
            [SimpleTimeScopeType.WEEKLY, weeklyValues],
            [SimpleTimeScopeType.MONTHLY, monthlyValues],
        ]),
        tagValues,
        tags,
        allSettings,
        range,
        date
    };
}

export interface DetailCorrelation {
    key: string;
    display: CorrelationDisplay;
    value: CorrelationResult;
    timeScope: SimpleTimeScopeType;
}

export function createDetailedCorrelations(correlations: Map<string, CorrelationResult>, result: AnalyticsResult, search: string, timeScope: SimpleTimeScopeType): DetailCorrelation[] {
    return correlations.entries()
        .filter(([k, v]) => k.includes(search) && Math.abs(v.coefficient) > 0.2)
        .map(([key, value]) => {
            return {
                key,
                display: convertResultKey(key, value, timeScope, result.forms, result.tags),
                value,
                timeScope
            };
        })
        .toArray().sort((a, b) => {
            if (b.value.coefficient > 0 && a.value.coefficient < 0) {
                return 1;
            } else if (b.value.coefficient < 0 && a.value.coefficient > 0) {
                return -1;
            } else {
                return Math.abs(b.value.coefficient) - Math.abs(a.value.coefficient);
            }
        });
}

export class AnalyticsStore extends AsyncStore<AnalyticsResult> {

    private readonly analyticsService: AnalyticsService;
    private readonly settingsService: AnalyticsSettingsService;

    private readonly historyService: AnalyticsHistoryService;
    private readonly ignoreService: CorrelationIgnoreService;

    private readonly date: Date;
    private readonly range: number;
    private readonly minimumSampleSize: number;

    constructor(analyticsService: AnalyticsService, settingsService: AnalyticsSettingsService,
                historyService: AnalyticsHistoryService, ignoreService: CorrelationIgnoreService,
                date: Date, range: number, minimumSampleSize: number) {

        super(fetchAnalytics(analyticsService, settingsService, historyService, ignoreService, date, range, minimumSampleSize));
        this.settingsService = settingsService;
        this.analyticsService = analyticsService;
        this.historyService = historyService;
        this.ignoreService = ignoreService;
        this.date = date;
        this.range = range;
        this.minimumSampleSize = minimumSampleSize;
    }

    async reload() {
        this.set(fetchAnalytics(this.analyticsService, this.settingsService, this.historyService, this.ignoreService,
            this.date, this.range, this.minimumSampleSize));
    }

    async getSpecificAnalytics(date: Date, range: number, minimumSampleSize: number): Promise<AnalyticsResult> {
        let analytics = await this.get();
        if (analytics.range == range) {
            return analytics;
        }

        return fetchAnalytics(this.analyticsService, this.settingsService, null, this.ignoreService,
            date, range, minimumSampleSize);
    }

    ignoreCorrelation(timeScope: SimpleTimeScopeType, key: string) {
        this.ignoreService.ignoreCorrelation({
            key,
            timeScope
        });
        this.updateResolved(r => {
            let results = r.correlations.get(timeScope);
            if (results == null) return r;
            results.delete(key);

            return r;
        })
    }

    async findHistoricalQuantitativeInsights(result: AnalyticsResult, timeScope: SimpleTimeScopeType, date: Date) {
        let basicAnalytics = result.basicAnalytics.get(timeScope);
        if (basicAnalytics == null) return [];

        let rawValues = result.rawValues.get(timeScope);
        if (rawValues == null) return [];

        return this.analyticsService.findHistoricalQuantitativeInsights(rawValues, basicAnalytics,
            date, timeScope, result.allSettings);
    }

    getNewestCorrelations(limit: number, until: number): AnalyticsHistoryEntry[] {
        return this.historyService.getNewestCorrelations(limit, until);
    }

}
