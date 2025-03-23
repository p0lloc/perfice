import {type Form, FormQuestionDataType} from "@perfice/model/form/form";
import type {Tag} from "@perfice/model/tag/tag";
import {
    CATEGORICAL_KEY_PREFIX,
    type CorrelationResult,
    DatasetKeyType,
    type HistoricalQuantitativeInsight,
    LAG_KEY_PREFIX,
    TAG_KEY_PREFIX,
    WEEK_DAY_KEY_PREFIX
} from "@perfice/services/analytics/analytics";
import type {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
import {TIME_SCOPE_UNITS} from "@perfice/model/variable/ui";
import {numberToMaxDecimals} from "@perfice/util/math";
import {formatValueAsDataType} from "@perfice/model/form/data";

export function convertSingleKey(key: string, type: DatasetKeyType, forms: Form[], tags: Tag[]): CorrelationDisplayPart {
    if (type == DatasetKeyType.CATEGORICAL) {
        key = key.substring(CATEGORICAL_KEY_PREFIX.length);
    }

    if (type == DatasetKeyType.WEEK_DAY) {
        let weekDayString = key.substring(WEEK_DAY_KEY_PREFIX.length);
        return {entityName: weekDayString, type: type, msg: `it is ${weekDayString}`};
    }

    if (type == DatasetKeyType.TAG) {
        let tag = tags.find(t => t.id == key.substring(TAG_KEY_PREFIX.length));
        if (tag == null) return {entityName: "Unknown tag", type, msg: "Unknown tag"};

        let tagName = tag.name;
        return {entityName: tagName, type, msg: `${tagName} tagged`};
    }

    let parts = key.split(":");
    let form = forms.find(f => f.id == parts[0]);
    if (form == null) return {entityName: "Unknown form", type, msg: "Unknown form"};

    let question = form.questions.find(q => q.id == parts[1]);
    if (question == null) return {entityName: "Unknown question", type, msg: "Unknown question"};

    let base = `${form.name} > ${question.name}`;

    if (parts.length > 2) {
        base = `${parts[2]} (${base})`;
    }

    return {entityName: base, type, msg: base};
}

export interface CorrelationDisplayPart {
    type: DatasetKeyType;
    entityName: string;
    msg: string;
}

export interface CorrelationDisplay {
    first: CorrelationDisplayPart;
    between: string;
    second: CorrelationDisplayPart;
}

const ELLIPSIS = "...";

export function ellipsis(text: string, maxLength: number) {
    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength - ELLIPSIS.length) + ELLIPSIS;
}

export function convertResultKey(key: string, result: CorrelationResult, timeScope: SimpleTimeScopeType, forms: Form[], tags: Tag[]): CorrelationDisplay {
    let parts = key.split("|");
    let first = parts[0];
    let second = parts[1];

    if (result.lagged) {
        let firstConverted = convertSingleKey(first.substring(LAG_KEY_PREFIX.length), result.firstKeyType, forms, tags);
        let secondConverted = convertSingleKey(second, result.secondKeyType, forms, tags);

        // Different order because it's the first one that is lagged
        return {
            first: secondConverted,
            second: firstConverted,
            between: `after ${TIME_SCOPE_UNITS[timeScope]} with`
        }
    }

    let firstConverted = convertSingleKey(first, result.firstKeyType, forms, tags);
    let secondConverted = convertSingleKey(second, result.secondKeyType, forms, tags);

    return {
        first: firstConverted,
        second: secondConverted,
        between: "when"
    }
}

export interface InsightText {
    text: string;
    percentage: string;
}

export function getInsightText(insight: HistoricalQuantitativeInsight, questionType: FormQuestionDataType): InsightText {
    let direction = insight.error > 1 ? "increased" : "decreased";
    let sign = insight.error > 1 ? "+" : "-";

    let percentage = numberToMaxDecimals(insight.diff * 100, 1);
    let currentFormatted = formatValueAsDataType(insight.current, questionType);
    let averageFormatted = formatValueAsDataType(insight.average, questionType);

    return {
        text: `greatly ${direction} (${currentFormatted}) compared to average ${averageFormatted}`,
        percentage: `(${sign}${percentage}%)`
    };
}
