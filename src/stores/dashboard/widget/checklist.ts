import {SimpleTimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";
import {derived, type Readable} from "svelte/store";
import {
    type ChecklistCondition,
    ChecklistConditionType,
    type ChecklistFormCondition,
    type ChecklistTagCondition,
    type DashboardChecklistWidgetSettings
} from "@perfice/model/dashboard/widgets/checklist";
import {VariableValueStore} from "@perfice/stores/variable/value";
import type {VariableService} from "@perfice/services/variable/variable";
import {
    comparePrimitives,
    type JournalEntryValue,
    type PrimitiveValue,
    PrimitiveValueType
} from "@perfice/model/primitive/primitive";

export interface ChecklistWidgetResult {
    conditions: ChecklistWidgetConditionResult[];
}

export interface ChecklistWidgetConditionResult {
    id: string;
    name: string;
    entryId: string | null;
}

function getCheckedEntryId(condition: ChecklistCondition, dependencies: Record<string, string>, results: PrimitiveValue[], variableIds: string[]): string | null {

    switch (condition.value.type) {
        case ChecklistConditionType.FORM: {
            let formCondition: ChecklistFormCondition = condition.value.value;
            let variableId = dependencies[formCondition.formId];
            let value = results[variableIds.indexOf(variableId)];
            if (value.type != PrimitiveValueType.LIST) return null;

            let matching = value.value.find(v => {
                if (v.type != PrimitiveValueType.JOURNAL_ENTRY) return false;
                let entryAnswers = v.value.value;

                // Every single answer must match
                return Object.entries(formCondition.answers).every(([key, value]) => {
                    let entryAnswer = entryAnswers[key];
                    if (entryAnswer == null) return false;

                    return comparePrimitives(entryAnswer, value);
                });
            });

            // Should always be JournalEntryValue from above check
            return matching != null ? (matching.value as JournalEntryValue).id : null;
        }

        case ChecklistConditionType.TAG: {
            let tagCondition: ChecklistTagCondition = condition.value.value;
            let variableId = dependencies[tagCondition.tagId];
            let value = results[variableIds.indexOf(variableId)];
            if (value.type != PrimitiveValueType.LIST || value.value.length < 1) return null;
            let first = value.value[0];
            if (first.type != PrimitiveValueType.TAG_ENTRY) return null;

            return first.value.id;
        }
    }
}

export function ChecklistWidget(dependencies: Record<string, string>, settings: DashboardChecklistWidgetSettings, date: Date,
                                weekStart: WeekStart, variableService: VariableService, key: string): Readable<Promise<ChecklistWidgetResult>> {

    let variableIds = Object.values(dependencies);
    let stores = variableIds.map(v => {
        return VariableValueStore(v,
            tSimple(SimpleTimeScopeType.DAILY, weekStart, date.getTime()), variableService, key, false);
    })


    return derived(stores, (value, set) => {
        set(new Promise(async (resolve) => {
            let results = await Promise.all(value);
            let conditions: ChecklistWidgetConditionResult[] = [];
            for (let condition of settings.conditions) {
                let entryId: string | null = getCheckedEntryId(condition, dependencies, results, variableIds);

                conditions.push({
                    id: condition.id,
                    name: condition.name,
                    entryId
                });
            }

            resolve({conditions});
        }));
    });
}