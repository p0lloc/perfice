import {SimpleTimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";
import type {VariableService} from "@perfice/services/variable/variable";
import {derived, type Readable} from "svelte/store";
import {VariableValueStore} from "@perfice/stores/variable/value";
import {
    type ChecklistCondition,
    ChecklistConditionType,
    type ChecklistFormCondition,
    type ChecklistTagCondition,
    type ChecklistWidgetSettings
} from "@perfice/model/sharedWidgets/checklist/checklist";
import {comparePrimitives, type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";


export interface ChecklistWidgetResult {
    conditions: ChecklistWidgetConditionResult[];
}

export interface ChecklistWidgetConditionResult {
    id: string;
    name: string;
    data: ChecklistData | undefined;
}

export type ChecklistData = {
    id: string;
    unchecked: boolean;
} & ChecklistDataType;

export type ChecklistDataType = {
    type: ChecklistConditionType.FORM,
    data: ChecklistFormData
} | {
    type: ChecklistConditionType.TAG,
    data: ChecklistTagData
}

export interface ChecklistFormData {
    entryId: string;
    formId: string;
    answers: Record<string, PrimitiveValue>;
}

export interface ChecklistTagData {
    tagId: string;
    entryId: string;
}

function getConditionDataFromResults(condition: ChecklistCondition, dependencies: Record<string, string>,
                                     results: PrimitiveValue[], variableIds: string[]): ChecklistData[] {

    let result: ChecklistData[] = [];
    switch (condition.value.type) {
        case ChecklistConditionType.FORM: {
            let formCondition: ChecklistFormCondition = condition.value.value;
            let variableId = dependencies[formCondition.formId];
            let value = results[variableIds.indexOf(variableId)];
            if (value.type != PrimitiveValueType.LIST) return [];

            for (let primitive of value.value) {
                if (primitive.type != PrimitiveValueType.JOURNAL_ENTRY) continue;

                result.push({
                    id: primitive.value.id,
                    type: ChecklistConditionType.FORM,
                    unchecked: false,
                    data: {
                        entryId: primitive.value.id,
                        formId: formCondition.formId,
                        answers: primitive.value.value,
                    }
                });
            }
            break;
        }

        case ChecklistConditionType.TAG: {
            let tagCondition: ChecklistTagCondition = condition.value.value;
            let variableId = dependencies[tagCondition.tagId];
            let value = results[variableIds.indexOf(variableId)];
            if (value.type != PrimitiveValueType.LIST || value.value.length < 1) return [];
            let first = value.value[0];
            if (first.type != PrimitiveValueType.TAG_ENTRY) return [];

            result.push({
                id: first.value.id,
                type: ChecklistConditionType.TAG,
                unchecked: false,
                data: {
                    entryId: first.value.id,
                    tagId: tagCondition.tagId,
                }
            });
            break;
        }
    }
    return result;
}

function getMatchingChecklistData(condition: ChecklistCondition, data: ChecklistData[]): ChecklistData | undefined {
    switch (condition.value.type) {
        case ChecklistConditionType.FORM: {
            let formCondition: ChecklistFormCondition = condition.value.value;

            return data.find(v => {
                if (v.type != ChecklistConditionType.FORM) return false;
                let entryAnswers = v.data.answers;

                // Every single answer must match
                return Object.entries(formCondition.answers).every(([key, value]) => {
                    let entryAnswer = entryAnswers[key];
                    if (entryAnswer == null) return false;

                    return comparePrimitives(entryAnswer, value);
                });
            });
        }

        case ChecklistConditionType.TAG: {
            let tagCondition: ChecklistTagCondition = condition.value.value;
            return data.find(v => {
                if (v.type != ChecklistConditionType.TAG) return false;
                return v.data.tagId == tagCondition.tagId;
            });
        }
    }
}

export function ChecklistWidget(dependencies: Record<string, string>, settings: ChecklistWidgetSettings, date: Date,
                                weekStart: WeekStart, variableService: VariableService, key: string, extraData: ChecklistData[] = []): Readable<Promise<ChecklistWidgetResult>> {

    let variableIds = Object.values(dependencies);
    let stores = variableIds.map(v => {
        return VariableValueStore(v,
            tSimple(settings.timeScope ?? SimpleTimeScopeType.DAILY, weekStart, date.getTime()), variableService, key, false);
    });

    return derived(stores, (value, set) => {
        set(new Promise(async (resolve) => {
            let results = await Promise.all(value);
            let conditions: ChecklistWidgetConditionResult[] = [];
            for (let condition of settings.conditions) {
                let data = [...extraData, ...getConditionDataFromResults(condition, dependencies, results, variableIds)];
                let matchingData: ChecklistData | undefined = getMatchingChecklistData(condition, data);

                conditions.push({
                    id: condition.id,
                    name: condition.name,
                    data: matchingData
                });
            }

            resolve({conditions});
        }));
    });
}
