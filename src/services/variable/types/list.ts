import type { IndexCollection } from "@perfice/db/collections";
import type {JournalEntry} from "@perfice/model/journal/journal";
import {
    pEntry,
    pList,
    type PrimitiveValue,
    PrimitiveValueType,
} from "@perfice/model/primitive/primitive";
import {isTimestampInRange, type TimeScope, WeekStart} from "@perfice/model/variable/time/time";
import {type VariableEvaluator, type VariableType, VariableTypeName} from "@perfice/model/variable/variable";
import type {EntryCreatedDependent, EntryDeletedDependent} from "@perfice/services/variable/graph";
import {deserializeTimeScope} from "@perfice/model/variable/time/serialization";
import Dexie from "dexie";

export function extractRawValue(p: PrimitiveValue): PrimitiveValue {
    if (p.type == PrimitiveValueType.DISPLAY) {
        return p.value.value;
    }

    return p;
}

export function extractFieldsFromAnswers(answers: Record<string, PrimitiveValue>, def: Record<string, boolean>): Record<string, PrimitiveValue> {
    let result: Record<string, PrimitiveValue> = {};
    for (let [key, display] of Object.entries(def)) {
        let answer = answers[key];
        if (answer == undefined)
            continue;

        result[key] = display ? answer : extractRawValue(answer);
    }

    return result;
}

export class ListVariableType implements VariableType, EntryCreatedDependent, EntryDeletedDependent {

    private readonly formId: string;
    private readonly fields: Record<string, boolean>;

    constructor(formId: string, fields: Record<string, boolean>) {
        this.formId = formId;
        this.fields = fields;
    }

    async onEntryCreated(entry: JournalEntry, variableId: string, weekStart: WeekStart, indexCollection: IndexCollection,
                         reevaluate: (context: TimeScope) => Promise<void>): Promise<void> {

        if (entry.formId != this.formId) return;

        let indices = await indexCollection.getIndicesByVariableId(variableId);
        for (let index of indices) {
            let scope = deserializeTimeScope(index.timeScope, weekStart);
            if (!isTimestampInRange(entry.timestamp, scope.value.convertToRange()))
                continue;

            if (index.value.type != PrimitiveValueType.LIST)
                continue;

            index.value.value
                .push(pEntry(entry.id, entry.timestamp, extractFieldsFromAnswers(entry.answers, this.fields)));

            await indexCollection.updateIndex(index);
            await reevaluate(scope);
        }

    }

    async onEntryDeleted(entry: JournalEntry, variableId: string, weekStart: WeekStart, indexCollection: IndexCollection, reevaluate: (context: TimeScope) => Promise<void>): Promise<void> {
        if (entry.formId != this.formId) return;

        // TODO: we need to streamline this so that we don't fetch indices multiple times
        let indices = await indexCollection.getIndicesByVariableId(variableId);
        for (let index of indices) {
            let scope = deserializeTimeScope(index.timeScope, weekStart);
            if (!isTimestampInRange(entry.timestamp, scope.value.convertToRange()))
                continue;

            if (index.value.type != PrimitiveValueType.LIST)
                continue;

            index.value.value = index.value.value
                .filter(v => v.type != PrimitiveValueType.ENTRY || v.value.id != entry.id)

            await indexCollection.updateIndex(index);
            await reevaluate(scope);
        }
    }

    async evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        let entries = await evaluator.getEntriesInTimeRange(this.formId);
        return pList(entries.map((e: JournalEntry) =>
            pEntry(e.id, e.timestamp, extractFieldsFromAnswers(e.answers, this.fields))));
    }

    getDependencies(): string[] {
        return [];
    }

    getFormId(): string {
        return this.formId;
    }

    getFields(): Record<string, boolean> {
        return this.fields;
    }

    getType(): VariableTypeName {
        return VariableTypeName.LIST;
    }

}
