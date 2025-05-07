import type {FormService} from "@perfice/services/form/form";
import {SimpleTimeScopeType, WeekStart} from "@perfice/model/variable/time/time";
import {
    type Form,
    type FormQuestion,
    FormQuestionDataType,
    FormQuestionDisplayType,
    isFormQuestionNumberRepresentable
} from "@perfice/model/form/form";
import {extractDisplayFromDisplay, extractValueFromDisplay} from "@perfice/services/variable/types/list";
import {primitiveAsNumber, primitiveAsString, PrimitiveValueType} from "@perfice/model/primitive/primitive";
import {
    dateToMidnight,
    dateToStartOfTimeScope,
    offsetDateByTimeScope,
    timestampToMidnight
} from "@perfice/util/time/simple";
import type {JournalCollection, TagCollection, TagEntryCollection} from "@perfice/db/collections";
import {WEEK_DAY_TO_NAME} from "@perfice/util/time/format";
import type {AnalyticsSettings} from "@perfice/model/analytics/analytics";
import type {Tag} from "@perfice/model/tag/tag";
import type {JournalEntry} from "@perfice/model/journal/journal";

export const WEEK_DAY_KEY_PREFIX = "wd_";
export const CATEGORICAL_KEY_PREFIX = "cat_";
export const LAG_KEY_PREFIX = "lag_";
export const TAG_KEY_PREFIX = "tag_";

export enum DatasetKeyType {
    QUANTITATIVE,
    WEEK_DAY,
    CATEGORICAL,
    TAG,
}

// We only support questions that have a finite set of options, free text would generate too many combinations
const CATEGORICAL_DISPLAY_TYPES = [
    FormQuestionDisplayType.SELECT,
    FormQuestionDisplayType.HIERARCHY,
]


function isCategoricalQuestion(question: FormQuestion): boolean {
    return CATEGORICAL_DISPLAY_TYPES.includes(question.displayType);
}

export function isAnalyticsSupportedQuestion(question: FormQuestion): boolean {
    return isFormQuestionNumberRepresentable(question.dataType) || isCategoricalQuestion(question);
}

export interface HistoricalQuantitativeInsight {
    formId: string;
    questionId: string;
    current: number;
    average: number;
    error: number;
    diff: number;
}

export function convertValue(value: Value, useMean: boolean): Value {
    if (!useMean) return value;

    if (value.count == 0) return value;

    return {
        value: value.value / value.count,
        count: value.count,
    }
}

export function normalizeNumberArray(arr: number[]) {
    let min = Infinity, max = -Infinity;

    for (let num of arr) {
        if (num < min) min = num;
        if (num > max) max = num;
    }

    return arr.map(num => (num - min) / (max - min));
}

export function getDatasetKeyType(key: string): [DatasetKeyType, boolean] {
    let lagged = false;
    if (key.startsWith(LAG_KEY_PREFIX)) {
        lagged = true;
    }

    key = lagged ? key.substring(LAG_KEY_PREFIX.length) : key;

    if (key.startsWith(WEEK_DAY_KEY_PREFIX)) return [DatasetKeyType.WEEK_DAY, lagged];
    if (key.startsWith(CATEGORICAL_KEY_PREFIX)) return [DatasetKeyType.CATEGORICAL, lagged];
    if (key.startsWith(TAG_KEY_PREFIX)) return [DatasetKeyType.TAG, lagged];

    return [DatasetKeyType.QUANTITATIVE, lagged];
}

export interface Value {
    value: number;
    count: number;
}

export function aValue(value: number, count: number): Value {
    return {
        value: value,
        count: count
    }
}

export type QuantitativeValues = Map<number, Value>; // Timestamp -> value
export type CategoricalValues = Map<string, Map<number, number>>; // Category -> timestamp -> frequency

export type ValueBag = {
    quantitative: true,
    values: QuantitativeValues
} | {
    quantitative: false,
    values: CategoricalValues
}

// Question id -> values
export type QuestionIdToValues = Map<string, ValueBag>;
// Form id -> question id -> values
export type RawAnalyticsValues = Map<string, QuestionIdToValues>;
export type TagAnalyticsValues = Map<string, Map<number, number>>; // Tag id -> timestamp -> tagged

export interface TimestampedValue<T> {
    value: T;
    timestamp: number;
}

export interface CorrelationResult {
    firstKeyType: DatasetKeyType;
    secondKeyType: DatasetKeyType;
    coefficient: number;
    lagged: boolean;
    first: number[];
    second: number[];
    sampleSize: number;
    timestamps: number[];
}

export type BasicAnalytics = {
    quantitative: true,
    value: QuantitativeBasicAnalytics
} | {
    quantitative: false,
    value: CategoricalBasicAnalytics
}
export type FormWeekDayAnalytics = {
    quantitative: true,
    value: QuantitativeWeekDayAnalytics
} | {
    quantitative: false,
    value: CategoricalWeekDayAnalytics
}

export interface QuantitativeBasicAnalytics {
    average: number;
    min: TimestampedValue<number>;
    max: TimestampedValue<number>;
}

export interface CategoricalFrequency {
    category: string;
    frequency: number;
}

export function aCategoricalFrequency(category: string, frequency: number): CategoricalFrequency {
    return {
        category,
        frequency
    }
}

export interface CategoricalBasicAnalytics {
    mostCommon: CategoricalFrequency;
    leastCommon: CategoricalFrequency;
}

export interface QuantitativeWeekDayAnalytics {
    values: Map<number, Value>; // Week day -> avg value
    // Week day when highest value occurred
    min: number;
    // Week day when lowest value occurred
    max: number;
}

export interface TagWeekDayAnalytics {
    values: Map<number, number>; // Week day -> frequency
    // Week day when highest value occurred
    min: number;
    // Week day when lowest value occurred
    max: number;
}

export type FlattenedDataSet = Map<number, number>;

export interface CorrelationDataSet {
    first: number[],
    second: number[],
    timestamps: number[]
}

export interface CategoricalWeekDayAnalytics {
    values: Map<number, CategoricalFrequency | null>; // Week day -> most frequent category
}

export class AnalyticsService {
    private readonly formService: FormService;
    private readonly journalCollection: JournalCollection;

    private readonly tagCollection: TagCollection;
    private readonly tagEntryCollection: TagEntryCollection;

    private weekStart: WeekStart;

    constructor(formService: FormService, journalService: JournalCollection,
                tagCollection: TagCollection, tagEntryCollection: TagEntryCollection, weekStart: WeekStart) {
        this.formService = formService;
        this.journalCollection = journalService;
        this.tagCollection = tagCollection;
        this.tagEntryCollection = tagEntryCollection;
        this.weekStart = weekStart;
    }

    flattenRawValues(raw: RawAnalyticsValues, allSettings: AnalyticsSettings[]): Map<string, FlattenedDataSet> {
        let res: Map<string, FlattenedDataSet> = new Map();

        for (let [formId, questionIds] of raw.entries()) {
            let settings = allSettings.find(s => s.formId == formId);
            if (settings == null) continue;

            for (let [questionId, bag] of questionIds.entries()) {
                if (bag.quantitative) {
                    let useMean = settings.useMeanValue[questionId] ?? true;
                    let timestamps = new Map(bag.values
                        .entries()
                        .map(([timestamp, value]) => [timestamp, convertValue(value, useMean).value]));

                    res.set(`${formId}:${questionId}`, timestamps);
                } else {
                    for (let [category, timestamps] of bag.values.entries()) {
                        res.set(`${CATEGORICAL_KEY_PREFIX}${formId}:${questionId}:${category}`, timestamps);
                    }
                }
            }
        }

        return res;
    }

    generateWeekDayDataSets(date: Date, scope: SimpleTimeScopeType, totalRange: number): Map<string, FlattenedDataSet> {
        let datasets: Map<string, FlattenedDataSet> = new Map();
        for (let i = 0; i < 7; i++) {
            datasets.set(WEEK_DAY_KEY_PREFIX + WEEK_DAY_TO_NAME.get(i), this.generateSingleWeekDayDataSet(scope, date, totalRange, i));
        }

        return datasets;
    }

    generateSingleWeekDayDataSet(scope: SimpleTimeScopeType, date: Date, totalRange: number, weekDay: number): FlattenedDataSet {
        let res: FlattenedDataSet = new Map();
        for (let i = totalRange - 1; i >= 0; i--) {
            let normalized = dateToMidnight(offsetDateByTimeScope(date, scope, -i));
            res.set(normalized.getTime(), normalized.getDay() === weekDay ? 1 : 0);
        }

        return res;
    }

    filterMatchingTimestamps(first: FlattenedDataSet, second: FlattenedDataSet,
                             firstIncludeEmpty: boolean, secondIncludeEmpty: boolean,
                             date: Date, scope: SimpleTimeScopeType, totalRange: number,
                             lag: boolean = false): CorrelationDataSet {

        let firstSize = firstIncludeEmpty ? totalRange : first.size;
        let secondSize = secondIncludeEmpty ? totalRange : second.size;

        let timestamps: number[] = [];
        let firstValues: number[] = [];
        let secondValues: number[] = [];

        // Swap data if second is smaller than first to loop over the smaller dataset
        // This also covers the case when first includes empty but second doesn't, thus we should loop over second since it actually has values
        // If second includes empty but first doesn't, it should already be larger and thus we would loop over first
        let swapped = false;
        if (secondSize < firstSize) {
            let tmpData = first;
            let tmpFirst = firstIncludeEmpty;

            firstIncludeEmpty = secondIncludeEmpty;
            secondIncludeEmpty = tmpFirst;
            first = second;
            second = tmpData;
            swapped = true;
        }

        function getLaggedTimestamp(timestamp: number) {
            // First is lagged back one day, so get second value for next day
            // If it's swapped we need to do the reverse
            return offsetDateByTimeScope(new Date(timestamp), scope, swapped ? -1 : 1).getTime();
        }

        if (secondIncludeEmpty && firstIncludeEmpty) {
            // If both include empty, we need to loop over the whole range

            // If data is lagged we can't include the most recent value
            // since the second value would be in the future
            let rangeEnd = lag ? 1 : 0;

            for (let i = totalRange - 1; i >= rangeEnd; i--) {
                let timestamp = dateToMidnight(offsetDateByTimeScope(date, scope, -i)).getTime();
                let fetchTimestamp = lag ? getLaggedTimestamp(timestamp) : timestamp;
                let firstValue = first.get(timestamp) ?? 0;
                let secondValue = second.get(fetchTimestamp) ?? 0;

                firstValues.push(firstValue);
                secondValues.push(secondValue);
                timestamps.push(timestamp);
            }
        } else {
            // TODO: This assumes the entries are added to the map in the same order as the timestamps
            //  This is not guaranteed to be the case
            for (let [timestamp, value] of first.entries()) {
                let fetchTimestamp = timestamp;
                if (lag) {
                    fetchTimestamp = getLaggedTimestamp(timestamp);
                }

                let secondValue = second.get(fetchTimestamp);
                if (secondValue == null) {
                    if (!secondIncludeEmpty) continue;

                    secondValue = 0;
                }

                // If it's swapped second == first, and fetchTimestamp provides the correct timestamp
                timestamps.push(swapped ? fetchTimestamp : timestamp);
                firstValues.push(value);
                secondValues.push(secondValue);
            }
        }

        return {
            first: swapped ? secondValues : firstValues,
            second: swapped ? firstValues : secondValues,
            timestamps: timestamps
        }
    }

    private async calculateBasicQuantitativeAnalytics(questionId: string, values: QuantitativeValues, settings: AnalyticsSettings): Promise<QuantitativeBasicAnalytics> {
        let average: number = 0;
        let minValue: TimestampedValue<number> | null = null;
        let maxValue: TimestampedValue<number> | null = null;

        let useMean = settings.useMeanValue[questionId] ?? true;
        for (let [timestamp, value] of values.entries()) {
            let converted = convertValue(value, useMean);

            average += converted.value;

            if (minValue == null || converted.value < minValue.value) {
                minValue = {value: converted.value, timestamp: timestamp};
            }

            if (maxValue == null || converted.value > maxValue.value) {
                maxValue = {value: converted.value, timestamp: timestamp};
            }
        }

        if (values.size != 0)
            average /= values.size;

        return {
            average: average,
            min: minValue ?? {value: 0, timestamp: 0},
            max: maxValue ?? {value: 0, timestamp: 0},
        }
    }

    private async calculateBasicCategoricalAnalytics(values: CategoricalValues): Promise<CategoricalBasicAnalytics> {
        let mostCommon: CategoricalFrequency | null = null;
        let leastCommon: CategoricalFrequency | null = null;

        for (let [category, frequency] of values.entries()) {
            let totalFrequency = frequency
                .values()
                .reduce((a, b) => a + b, 0);

            if (mostCommon == null || totalFrequency > mostCommon.frequency) {
                mostCommon = {category: category, frequency: totalFrequency};
            }

            if (leastCommon == null || totalFrequency < leastCommon.frequency) {
                leastCommon = {category: category, frequency: totalFrequency};
            }
        }

        return {
            mostCommon: mostCommon ?? {category: "", frequency: 0},
            leastCommon: leastCommon ?? {category: "", frequency: 0}
        }
    }

    async calculateAllBasicAnalytics(values: RawAnalyticsValues, allSettings: AnalyticsSettings[]): Promise<Map<string, Map<string, BasicAnalytics>>> {
        let res: Map<string, Map<string, BasicAnalytics>> = new Map();
        for (let [formId, questionIdToValues] of values.entries()) {
            let settings = allSettings.find(s => s.formId == formId);
            if (settings == null) continue;

            let map = new Map();
            for (let [questionId, values] of questionIdToValues.entries()) {
                map.set(questionId, await this.calculateBasicAnalytics(questionId, values, settings));
            }
            res.set(formId, map);
        }
        return res;
    }

    async findHistoricalQuantitativeInsights(values: RawAnalyticsValues, allBasicAnalytics: Map<string, Map<string, BasicAnalytics>>,
                                             date: Date, timeScope: SimpleTimeScopeType, allSettings: AnalyticsSettings[], threshold: number = 0.3): Promise<HistoricalQuantitativeInsight[]> {
        let currentTimestamp = dateToStartOfTimeScope(date, timeScope, this.weekStart).getTime();
        let result: HistoricalQuantitativeInsight[] = [];
        for (let [formId, questionIdToValues] of values.entries()) {
            let forForm = allBasicAnalytics.get(formId);
            if (forForm == null) continue;

            let settings = allSettings.find(s => s.formId == formId);
            if (settings == null) continue;

            for (let [questionId, values] of questionIdToValues.entries()) {
                if (!values.quantitative) continue;

                let byQuestion = forForm.get(questionId);
                if (byQuestion == null || !byQuestion.quantitative) continue;

                let currentValue = values.values.get(currentTimestamp);
                if (currentValue == null)
                    continue;

                let useMeanValue = settings.useMeanValue[questionId] ?? true;
                let currentNumericalValue = convertValue(currentValue, useMeanValue).value;
                let average = byQuestion.value.average;

                let error = average != 0 ? currentNumericalValue / average : currentNumericalValue;
                let diff = error != 0 ? Math.abs(error - 1) : 0;

                if (diff < threshold)
                    continue;

                result.push({
                    formId: formId,
                    questionId: questionId,
                    current: currentNumericalValue,
                    average: average,
                    diff,
                    error: error
                });
            }
        }

        return result;
    }

    async calculateBasicAnalytics(questionId: string, values: ValueBag, settings: AnalyticsSettings): Promise<BasicAnalytics> {
        if (values.quantitative) {
            return {
                quantitative: true,
                value: await this.calculateBasicQuantitativeAnalytics(questionId, values.values, settings)
            }
        } else {
            return {
                quantitative: false,
                value: await this.calculateBasicCategoricalAnalytics(values.values)
            }
        }
    }

    private async calculateWeekDayAnalyticsCategorical(values: CategoricalValues): Promise<CategoricalWeekDayAnalytics> {
        let weekDays = new Map<number, CategoricalFrequency | null>();
        for (let i = 0; i < 7; i++) {
            weekDays.set(i, null);
        }

        for (let [category, timestamps] of values.entries()) {
            let weekDayToFrequency = new Map<number, number>();
            for (let [timestamp, frequency] of timestamps.entries()) {
                let date = new Date(timestamp);
                let weekDay = date.getDay();

                weekDayToFrequency.set(weekDay, (weekDayToFrequency.get(weekDay) ?? 0) + frequency);
            }

            for (let [weekDay, frequency] of weekDayToFrequency.entries()) {
                let existing = weekDays.get(weekDay);
                if (existing == null || frequency > existing.frequency) {
                    weekDays.set(weekDay, {category: category, frequency: frequency});
                }
            }
        }

        return {
            values: weekDays
        }
    }

    private async calculateWeekDayAnalyticsQuantitative(questionId: string, values: QuantitativeValues, settings: AnalyticsSettings): Promise<QuantitativeWeekDayAnalytics> {
        let weekDays = new Map<number, Value>();
        for (let i = 0; i < 7; i++) {
            weekDays.set(i, {value: 0, count: 0});
        }

        let useMeanValue = settings.useMeanValue[questionId] ?? true;
        for (let [timestamp, value] of values.entries()) {
            let date = new Date(timestamp);
            let weekDay = date.getDay();

            let existing = weekDays.get(weekDay);
            if (existing == null) continue;

            existing.value += convertValue(value, useMeanValue).value;
            existing.count += 1;
        }

        let minWeekday = 0;
        let maxWeekday = 0;
        let min: number | null = null;
        let max: number | null = 0;
        for (let i = 0; i < 7; i++) {
            let existing = weekDays.get(i);
            if (existing == null) continue;

            if (existing.count == 0) continue;

            // Calculate average
            let avg = existing.value / existing.count;

            if (min == null || avg < min) {
                min = avg;
                minWeekday = i;
            }

            if (max == null || avg > max) {
                max = avg;
                maxWeekday = i;
            }

            weekDays.set(i, {
                value: avg,
                count: existing.count
            });
        }

        return {
            values: weekDays,
            min: minWeekday,
            max: maxWeekday,
        }
    }

    async calculateTagWeekDayAnalytics(values: Map<number, number>): Promise<TagWeekDayAnalytics> {
        let weekDays = new Map<number, number>();
        for (let i = 0; i < 7; i++) {
            weekDays.set(i, 0);
        }

        for (let [timestamp, value] of values.entries()) {
            let date = new Date(timestamp);
            let weekDay = date.getDay();

            let existing = weekDays.get(weekDay);
            if (existing == null) continue;

            weekDays.set(weekDay, existing + value); // Value is 1 when tag is logged
        }

        let minWeekday = 0;
        let maxWeekday = 0;
        let min: number | null = null;
        let max: number | null = 0;
        for (let i = 0; i < 7; i++) {
            let existing = weekDays.get(i);
            if (existing == null) continue;

            if (min == null || existing < min) {
                min = existing;
                minWeekday = i;
            }

            if (max == null || existing > max) {
                max = existing;
                maxWeekday = i;
            }
        }

        return {
            values: weekDays,
            min: minWeekday,
            max: maxWeekday,
        }
    }

    async calculateFormWeekDayAnalytics(questionId: string, values: ValueBag, settings: AnalyticsSettings): Promise<FormWeekDayAnalytics> {
        if (values.quantitative) {
            return {
                quantitative: true,
                value: await this.calculateWeekDayAnalyticsQuantitative(questionId, values.values, settings)
            }
        } else {
            return {
                quantitative: false,
                value: await this.calculateWeekDayAnalyticsCategorical(values.values)
            }
        }
    }


    private constructResultKey(firstKey: string, secondKey: string) {
        return `${firstKey}|${secondKey}`;
    }

    private stripLag(key: string) {
        return key.startsWith(LAG_KEY_PREFIX) ? key.substring(LAG_KEY_PREFIX.length) : key;
    }

    private extractFormFromQuantitativeKey(key: string) {
        key = this.stripLag(key);
        return key.substring(0, key.indexOf(":"));
    }

    private includeEmptyForKey(keyType: DatasetKeyType) {
        return keyType == DatasetKeyType.WEEK_DAY || keyType == DatasetKeyType.CATEGORICAL;
    }

    private generateLagDataSet(data: Map<string, FlattenedDataSet>): Map<string, FlattenedDataSet> {
        let res: Map<string, FlattenedDataSet> = new Map();
        for (let [key, value] of data.entries()) {
            res.set(`${LAG_KEY_PREFIX}${key}`, value);
        }

        return res;
    }

    private getSampleSize(firstType: DatasetKeyType, secondType: DatasetKeyType,
                          first: number[], second: number[], firstDataset: FlattenedDataSet, secondDataset: FlattenedDataSet): number {

        let firstSize = firstDataset.size;
        let secondSize = secondDataset.size;

        // Tags have huge datasets of mostly zeroes, but we practically only care when they are 1
        if (firstType == DatasetKeyType.TAG) {
            firstSize = first.reduce((a, b) => a + b, 0);
        }
        if (secondType == DatasetKeyType.TAG) {
            secondSize = second.reduce((a, b) => a + b, 0);
        }

        // If including empty we might expand the dataset, but we want the absolute MINIMAL size
        return Math.min(
            Math.min(first.length, firstSize),
            Math.min(second.length, secondSize)
        );
    }

    async runBasicCorrelations(values: RawAnalyticsValues, tagValues: TagAnalyticsValues,
                               allSettings: AnalyticsSettings[],
                               date: Date, range: number, minimumSampleSize: number, useWeekDays: boolean = true, useLagged: boolean = true): Promise<Map<string, CorrelationResult>> {

        let flattenedFormValues = this.flattenRawValues(values, allSettings);
        tagValues.forEach((value, key) => flattenedFormValues.set(key, value));

        if (useLagged) {
            let lagged = this.generateLagDataSet(flattenedFormValues);
            lagged.forEach((value, key) => flattenedFormValues.set(key, value));
        }

        if (useWeekDays) {
            // Add week day datasets
            let datasets = this.generateWeekDayDataSets(date, SimpleTimeScopeType.DAILY, range);
            datasets.forEach((value, key) => flattenedFormValues.set(key, value));
        }

        let results: Map<string, CorrelationResult> = new Map();
        let tried: Set<string> = new Set();
        for (let [firstKey, firstDataset] of flattenedFormValues.entries()) {
            for (let [secondKey, secondDataset] of flattenedFormValues.entries()) {
                // Skip if same key
                if (firstKey == secondKey) continue;

                let [firstType, firstLag] = getDatasetKeyType(firstKey);
                let [secondType, secondLag] = getDatasetKeyType(secondKey);

                if (secondLag) continue;

                // Skip if actually same key but first is just lagged
                if (firstLag && this.stripLag(firstKey) == secondKey) continue;

                let resultKey = this.constructResultKey(firstKey, secondKey);

                // Skip if same key but reverse order
                let reverseOrderKey = this.constructResultKey(secondKey, firstKey);
                if (tried.has(resultKey) || tried.has(reverseOrderKey)) continue;

                tried.add(resultKey);

                if (secondType == DatasetKeyType.WEEK_DAY && firstLag) {
                    // Week day and lag are not correlated
                    continue;
                }

                // Skip if both are week day datasets
                if (firstType == DatasetKeyType.WEEK_DAY && secondType == DatasetKeyType.WEEK_DAY) {
                    continue;
                }

                if (firstType == DatasetKeyType.QUANTITATIVE && secondType == DatasetKeyType.QUANTITATIVE) {
                    if (this.extractFormFromQuantitativeKey(firstKey) == this.extractFormFromQuantitativeKey(secondKey)) {
                        // Don't correlate quantitative values from the same form
                        continue;
                    }
                }


                let firstIncludeEmpty = secondType == DatasetKeyType.WEEK_DAY || this.includeEmptyForKey(firstType);
                let secondIncludeEmpty = firstType == DatasetKeyType.WEEK_DAY || this.includeEmptyForKey(secondType);

                let matching = this.filterMatchingTimestamps(
                    firstDataset,
                    secondDataset,
                    firstIncludeEmpty,
                    secondIncludeEmpty,
                    date,
                    SimpleTimeScopeType.DAILY,
                    range,
                    firstLag
                );

                let sampleSize = this.getSampleSize(firstType, secondType, matching.first,
                    matching.second, firstDataset, secondDataset);

                // Ignore samples that are not large enough
                if (sampleSize < minimumSampleSize)
                    continue;

                let coefficient = this.pearsonCorrelation(matching.first, matching.second);
                results.set(resultKey, {
                    firstKeyType: firstType,
                    secondKeyType: secondType,
                    coefficient,
                    first: matching.first,
                    second: matching.second,
                    lagged: firstLag,
                    sampleSize,
                    timestamps: matching.timestamps
                });
            }
        }

        return results;
    }

    pearsonCorrelation(x: number[], y: number[]): number {
        if (x.length == 0)
            return 0;

        if (x.length !== y.length || x.length === 0) {
            throw new Error("Arrays must have the same non-zero length");
        }

        const n = x.length;
        const meanX = x.reduce((sum, val) => sum + val, 0) / n;
        const meanY = y.reduce((sum, val) => sum + val, 0) / n;

        let numerator = 0;
        let sumXSquare = 0;
        let sumYSquare = 0;

        for (let i = 0; i < n; i++) {
            const dx = x[i] - meanX;
            const dy = y[i] - meanY;
            numerator += dx * dy;
            sumXSquare += dx * dx;
            sumYSquare += dy * dy;
        }

        const denominator = Math.sqrt(sumXSquare) * Math.sqrt(sumYSquare);
        return denominator === 0 ? 0 : numerator / denominator;
    }

    private getTimeRange(endDate: Date, timeScope: SimpleTimeScopeType, range: number): [number, number] {
        let start = offsetDateByTimeScope(endDate, timeScope, -range);
        return [start.getTime(), endDate.getTime()];
    }

    async fetchTagValues(timeScope: SimpleTimeScopeType, date: Date, range: number): Promise<[TagAnalyticsValues, Tag[]]> {
        let [start, end] = this.getTimeRange(date, timeScope, range);
        let tags = await this.tagCollection.getTags();
        let tagEntries = await this.tagEntryCollection.getEntriesByTimeRange(start, end);

        const serialize =
            (tagId: string, timestamp: number) => `${tagId}:${timestampToMidnight(timestamp).toString()}`;

        let loggedDates: Set<string> = new Set();
        for (let entry of tagEntries) {
            loggedDates.add(serialize(entry.tagId, timestampToMidnight(entry.timestamp)));
        }

        let result: Map<string, Map<number, number>> = new Map();
        for (let tag of tags) {
            let logged: Map<number, number> = new Map();
            for (let i = range - 1; i >= 0; i--) {
                let timestamp = dateToMidnight(offsetDateByTimeScope(date, timeScope, -i)).getTime();
                logged.set(timestamp, loggedDates.has(serialize(tag.id, timestamp)) ? 1 : 0);
            }

            result.set(`${TAG_KEY_PREFIX}${tag.id}`, logged);
        }

        return [result, tags];
    }

    async fetchFormsAndEntries(date: Date, range: number): Promise<[Form[], JournalEntry[]]> {
        let forms = await this.formService.getForms();
        let start = offsetDateByTimeScope(date, SimpleTimeScopeType.DAILY, -range);
        let entries = await this.journalCollection
            .getEntriesByTimeRange(start.getTime(), date.getTime());

        return [forms, entries];
    }

    /**
     * Interpolates empty analytics values with data from the closest timestamps that contain data.
     * This is done in-place.
     * @param values Values to interpolate (is mutated)
     * @param interpolated Form id -> list of timestamps where data is available
     * @param timeScope Time scope of the data
     * @param date Date to interpolate backwards from
     * @param range Range to interpolate
     */
    interpolateValues(values: RawAnalyticsValues, interpolated: Map<string, number[]>, timeScope: SimpleTimeScopeType, date: Date, range: number) {
        let start = offsetDateByTimeScope(dateToStartOfTimeScope(date, timeScope, this.weekStart), timeScope, -range);
        for (let [formId, timestamps] of interpolated) {
            let valuesByForm = values.get(formId);
            if (valuesByForm == null) continue;

            for (let valueBag of valuesByForm.values()) {
                if (!valueBag.quantitative) continue;
                for (let i = 0; i < range; i++) {
                    let date = offsetDateByTimeScope(start, timeScope, i).getTime();

                    let val = valueBag.values.get(date)
                    if (val != null) continue;

                    let closestTimestamps = timestamps.filter(t => t <= date).sort((a, b) => a - b);
                    if (closestTimestamps.length == 0) continue;
                    let closestTimestamp = closestTimestamps[closestTimestamps.length - 1];

                    let interpolatedValue = valueBag.values.get(closestTimestamp);
                    if (interpolatedValue == null) continue;

                    valueBag.values.set(date, interpolatedValue);
                }
            }
        }
    }

    async constructRawValues(forms: Form[], entries: JournalEntry[], timeScope: SimpleTimeScopeType,
                             settings: AnalyticsSettings[] = []): Promise<[RawAnalyticsValues, Map<string, number[]>]> {

        // Form id -> question id -> values
        let res: RawAnalyticsValues = new Map();
        let displayAnswerQuestions: string[] = []; // Question ids that should use display value as category
        let interpolateTimestamps: Map<string, number[]> = new Map();
        for (let form of forms) {
            let map: QuestionIdToValues = new Map();

            for (let question of form.questions) {
                if (question.dataType == FormQuestionDataType.HIERARCHY) {
                    // Hierarchy question values are lists, we want to use the string display value as the category
                    displayAnswerQuestions.push(question.id);
                }

                // Number questions are always quantitative
                if (isFormQuestionNumberRepresentable(question.dataType)) {
                    map.set(question.id, {
                        quantitative: true,
                        values: new Map()
                    });
                } else if (isCategoricalQuestion(question)) {
                    map.set(question.id, {
                        quantitative: false,
                        values: new Map()
                    });
                }
            }

            res.set(form.id, map);

            let settingsForForm = settings.find(s => s.formId == form.id);
            if (settingsForForm != null && settingsForForm.interpolate) {
                interpolateTimestamps.set(form.id, []);
            }
        }

        for (let entry of entries) {
            let data = res.get(entry.formId);
            if (data === undefined) continue;

            let timestamp = dateToStartOfTimeScope(new Date(entry.timestamp), timeScope, this.weekStart).getTime();

            let interpolate = interpolateTimestamps.get(entry.formId);
            if (interpolate != null) {
                interpolate.push(timestamp);
            }

            for (let [questionId, value] of Object.entries(entry.answers)) {
                let bag = data.get(questionId);
                if (bag === undefined) continue;

                if (bag.quantitative) {
                    let number = primitiveAsNumber(extractValueFromDisplay(value));
                    let existingForTimestamp = bag.values.get(timestamp);
                    if (existingForTimestamp != null) {
                        existingForTimestamp.count++;
                        existingForTimestamp.value += number;
                    } else {
                        bag.values.set(timestamp, {
                            count: 1,
                            value: number
                        })
                    }
                } else {
                    function updateCategorizedBag(bag: Map<string, Map<number, number>>, category: string) {
                        let existingCategory = bag.get(category);
                        if (existingCategory != null) {
                            let existingFrequency = existingCategory.get(timestamp);
                            if (existingFrequency != null) {
                                existingCategory.set(timestamp, existingFrequency + 1);
                            } else {
                                existingCategory.set(timestamp, 1);
                            }
                        } else {
                            bag.set(category, new Map([[timestamp, 1]]));
                        }
                    }

                    let extracted = displayAnswerQuestions.includes(questionId)
                        ? extractDisplayFromDisplay(value)
                        : extractValueFromDisplay(value);

                    if (extracted.type == PrimitiveValueType.LIST) {
                        extracted.value.forEach(v => updateCategorizedBag(bag.values, primitiveAsString(v)));
                    } else {
                        updateCategorizedBag(bag.values, primitiveAsString(extracted));
                    }

                }
            }
        }


        return [res, interpolateTimestamps];
    }

    setWeekStart(weekStart: WeekStart) {
        this.weekStart = weekStart;
    }

}
