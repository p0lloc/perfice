import type {FormService} from "@perfice/services/form/form";
import {SimpleTimeScopeType, WeekStart} from "@perfice/model/variable/time/time";
import {type Form, FormQuestionDataType, isFormQuestionNumberRepresentable} from "@perfice/model/form/form";
import {extractDisplayFromDisplay, extractValueFromDisplay} from "@perfice/services/variable/types/list";
import {
    primitiveAsNumber,
    primitiveAsString,
    PrimitiveValueType
} from "@perfice/model/primitive/primitive";
import {dateToMidnight, dateToStartOfTimeScope, offsetDateByTimeScope} from "@perfice/util/time/simple";
import type {JournalCollection} from "@perfice/db/collections";
import {WEEK_DAY_TO_NAME} from "@perfice/util/time/format";

const WEEK_DAY_KEY_PREFIX = "wd_";
const CATEGORICAL_KEY_PREFIX = "cat_";
const LAG_KEY_PREFIX = "lag_";

export enum DatasetKeyType {
    QUANTITATIVE,
    WEEK_DAY,
    CATEGORICAL,
    LAGGED
}

export function getDatasetKeyType(key: string): [DatasetKeyType, boolean] {
    let lagged = false;
    if (key.startsWith(LAG_KEY_PREFIX)){
        lagged = true;
    }

    key = lagged ? key.substring(LAG_KEY_PREFIX.length) : key;

    if (key.startsWith(WEEK_DAY_KEY_PREFIX)) return [DatasetKeyType.WEEK_DAY, lagged];
    if (key.startsWith(CATEGORICAL_KEY_PREFIX)) return [DatasetKeyType.CATEGORICAL, lagged];

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

// "formId:questionId": {0 => 12000, 1 => 78721}
// "formId:questionId": {0 => 12000, 1 => 78721, 2 => 31090}

export type QuantitativeValues = Map<number, Value>; // Timestamp -> value
export type CategoricalValues = Map<string, Map<number, number>>; // Category -> timestamp -> frequency

export type ValueBag = {
    quantitative: true,
    values: QuantitativeValues
} | {
    quantitative: false,
    values: CategoricalValues
}

export type QuestionIdToValues = Map<string, ValueBag>;
export type RawAnalyticsValues = Map<string, QuestionIdToValues>;

export interface TimestampedValue<T> {
    value: T;
    timestamp: number;
}

export interface CorrelationResult {
    coefficient: number;
    first: number[];
    second: number[];
    timestamps: number[];
    firstSize: number;
    secondSize: number;
}

export type BasicAnalytics = {
    quantitative: true,
    value: QuantitativeBasicAnalytics
} | {
    quantitative: false,
    value: CategoricalBasicAnalytics
}
export type WeekDayAnalytics = {
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

export interface AnalyticsSettings {
    formId: string;
    useMeanValue: Record<string, boolean>; // Question id -> boolean
}

export interface QuantitativeWeekDayAnalytics {
    values: Map<number, Value>; // Week day -> avg value
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

    constructor(formService: FormService, journalService: JournalCollection) {
        this.formService = formService;
        this.journalCollection = journalService;
    }

    flattenRawValues(raw: RawAnalyticsValues): Map<string, FlattenedDataSet> {
        let res: Map<string, FlattenedDataSet> = new Map();

        for (let [formId, questionIds] of raw.entries()) {
            for (let [questionId, bag] of questionIds.entries()) {
                if (bag.quantitative) {
                    let useMean = true;
                    let timestamps = new Map(bag.values
                        .entries()
                        .map(([timestamp, value]) => [timestamp, this.convertValue(value, useMean).value]));

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

        function getLaggedTimestamp(timestamp: number){
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
            for (let [timestamp, value] of first.entries()) {
                let fetchTimestamp = timestamp;
                if(lag){
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

        let useMean = settings.useMeanValue[questionId] ?? false;
        for (let [timestamp, value] of values.entries()) {
            let converted = this.convertValue(value, useMean);

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

    private async calculateBasicCategoricalAnalytics(values: CategoricalValues, settings: AnalyticsSettings): Promise<CategoricalBasicAnalytics> {
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

    async calculateBasicAnalytics(questionId: string, values: ValueBag, settings: AnalyticsSettings): Promise<BasicAnalytics> {
        if (values.quantitative) {
            return {
                quantitative: true,
                value: await this.calculateBasicQuantitativeAnalytics(questionId, values.values, settings)
            }
        } else {
            return {
                quantitative: false,
                value: await this.calculateBasicCategoricalAnalytics(values.values, settings)
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

        let useMeanValue = settings.useMeanValue[questionId] ?? false;
        for (let [timestamp, value] of values.entries()) {
            let date = new Date(timestamp);
            let weekDay = date.getDay();

            let existing = weekDays.get(weekDay);
            if (existing == null) continue;

            existing.value += this.convertValue(value, useMeanValue).value;
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

    async calculateWeekDayAnalytics(questionId: string, values: ValueBag, settings: AnalyticsSettings): Promise<WeekDayAnalytics> {
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

    private convertValue(value: Value, useMean: boolean): Value {
        if (!useMean) return value;

        if (value.count == 0) return value;

        return {
            value: value.value / value.count,
            count: value.count,
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

    async runBasicCorrelations(date: Date, range: number, minimumSampleSize: number): Promise<Map<string, CorrelationResult>> {
        let [values] = await this.fetchRawValues(SimpleTimeScopeType.DAILY, range);
        let flattened = this.flattenRawValues(values);
        let lagged = this.generateLagDataSet(flattened);
        lagged.forEach((value, key) => flattened.set(key, value));

        // Add week day datasets
        let datasets = this.generateWeekDayDataSets(date, SimpleTimeScopeType.DAILY, range);
        datasets.forEach((value, key) => flattened.set(key, value));

        let results: Map<string, CorrelationResult> = new Map();
        for (let [firstKey, firstDataset] of flattened.entries()) {
            for (let [secondKey, secondDataset] of flattened.entries()) {
                // Skip if same key
                if (firstKey == secondKey) continue;

                let [firstType, firstLag] = getDatasetKeyType(firstKey);
                let [secondType, secondLag] = getDatasetKeyType(secondKey);

                if(secondLag) continue;

                // Skip if actually same key but first is just lagged
                if(firstLag && this.stripLag(firstKey) == secondKey) continue;

                // Skip if same key but reverse order
                let existingKey = this.constructResultKey(secondKey, firstKey);
                if (results.has(existingKey)) continue;

                if(secondType == DatasetKeyType.WEEK_DAY && firstLag){
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

                // Ignore samples that are not large enough
                let sampleSize = Math.min(firstDataset.size, secondDataset.size);
                if (sampleSize < minimumSampleSize)
                    continue;

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

                let coefficient = this.pearsonCorrelation(matching.first, matching.second);
                results.set(this.constructResultKey(firstKey, secondKey), {
                    coefficient,
                    first: matching.first,
                    second: matching.second,
                    firstSize: firstDataset.size,
                    secondSize: secondDataset.size,
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

    async fetchRawValues(timeScope: SimpleTimeScopeType, range: number): Promise<[RawAnalyticsValues, Form[]]> {
        let forms = await this.formService.getForms();
        let entries = await this.journalCollection.getEntriesFromTime(offsetDateByTimeScope(new Date(0), timeScope, -30).getTime());

        // Form id -> question id -> values
        let res: RawAnalyticsValues = new Map();
        let displayAnswerQuestions: string[] = []; // Question ids that should use display value as category
        for (let form of forms) {
            let map: QuestionIdToValues = new Map();

            for (let question of form.questions) {
                if (question.dataType == FormQuestionDataType.HIERARCHY) {
                    displayAnswerQuestions.push(question.id);
                }

                if (isFormQuestionNumberRepresentable(question.dataType)) {
                    map.set(question.id, {
                        quantitative: true,
                        values: new Map()
                    });
                } else {
                    map.set(question.id, {
                        quantitative: false,
                        values: new Map()
                    });
                }
            }

            res.set(form.id, map);
        }


        for (let entry of entries) {
            let data = res.get(entry.formId);
            if (data === undefined) continue;

            let timestamp = dateToStartOfTimeScope(new Date(entry.timestamp), timeScope, WeekStart.MONDAY).getTime();

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

        return [res, forms];
    }
}