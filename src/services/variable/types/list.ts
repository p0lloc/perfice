import type {JournalEntry} from "@perfice/model/journal/journal";
import {
    pEntry,
    pList,
    type PrimitiveValue,
    PrimitiveValueType,
} from "@perfice/model/primitive/primitive";
import {type VariableEvaluator, type VariableIndex, type VariableType, VariableTypeName} from "@perfice/model/variable/variable";
import {
    VariableIndexActionType,
    type EntryCreatedDependent,
    type EntryDeletedDependent,
    type VariableIndexAction,
    type EntryUpdatedDependent
} from "@perfice/services/variable/graph";

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

export class ListVariableType implements VariableType, EntryCreatedDependent, EntryDeletedDependent, EntryUpdatedDependent {

    private readonly formId: string;
    private readonly fields: Record<string, boolean>;

    constructor(formId: string, fields: Record<string, boolean>) {
        this.formId = formId;
        this.fields = fields;
    }

    async onEntryUpdated(entry: JournalEntry, indices: VariableIndex[]): Promise<VariableIndexAction[]> {
        if (entry.formId != this.formId) return [];

        let actions: VariableIndexAction[] = [];
        for (let index of indices) {
            if (index.value.type != PrimitiveValueType.LIST)
                continue;

            // Entry was updated, try to find and update it in the list
            let val = index.value.value;
            for(let entries of val){
                if(entries.type == PrimitiveValueType.ENTRY && entries.value.id == entry.id){
                    entries.value.value = extractFieldsFromAnswers(entry.answers, this.fields);
                    entries.value.timestamp = entry.timestamp;
                }
            }

            actions.push({
                type: VariableIndexActionType.UPDATE,
                index
            });
        }

        return actions;
    }

    async onEntryCreated(entry: JournalEntry, indices: VariableIndex[]): Promise<VariableIndexAction[]> {
        if (entry.formId != this.formId) return [];

        let actions: VariableIndexAction[] = [];
        for (let index of indices) {
            if (index.value.type != PrimitiveValueType.LIST)
                continue;

            // Entry was created, add it to the list
            index.value.value
                .push(pEntry(entry.id, entry.timestamp, extractFieldsFromAnswers(entry.answers, this.fields)));

            actions.push({
                type: VariableIndexActionType.UPDATE,
                index
            });
        }

        return actions;
    }

    async onEntryDeleted(entry: JournalEntry, indices: VariableIndex[]): Promise<VariableIndexAction[]> {
        if (entry.formId != this.formId) return [];

        let actions: VariableIndexAction[] = [];
        for (let index of indices) {
            if (index.value.type != PrimitiveValueType.LIST)
                continue;

            // Entry was deleted, remove it from the list
            index.value.value = index.value.value
                .filter(v => v.type != PrimitiveValueType.ENTRY || v.value.id != entry.id)

            actions.push({
                type: VariableIndexActionType.UPDATE,
                index
            });
        }

        return actions;
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
