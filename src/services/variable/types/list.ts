import type {JournalEntry} from "@perfice/model/journal/journal";
import {pJournalEntry, pList, type PrimitiveValue, PrimitiveValueType,} from "@perfice/model/primitive/primitive";
import {
    type VariableEvaluator,
    type VariableIndex,
    type VariableType,
    VariableTypeName
} from "@perfice/model/variable/variable";
import {
    EntryAction,
    type JournalEntryDependent,
    type VariableIndexAction,
    VariableIndexActionType,
} from "@perfice/services/variable/graph";
import {type JournalEntryFilter, shouldFilterOutEntry} from "@perfice/services/variable/filtering";

export function extractValueFromDisplay(p: PrimitiveValue): PrimitiveValue {
    if (p.type == PrimitiveValueType.DISPLAY) {
        return p.value.value;
    }

    return p;
}

export function extractAnswerValuesFromDisplay(answers: Record<string, PrimitiveValue>) {
    return Object.fromEntries(
        Object.entries(answers).map(([k, v]) => [k, extractValueFromDisplay(v)]));
}

export function extractDisplayFromDisplay(p: PrimitiveValue): PrimitiveValue {
    if (p.type == PrimitiveValueType.DISPLAY && p.value.display != null) {
        return p.value.display;
    }

    return p;
}

export function extractFieldsFromAnswers(answers: Record<string, PrimitiveValue>, template: Record<string, boolean>): Record<string, PrimitiveValue> {
    let result: Record<string, PrimitiveValue> = {};
    for (let [key, display] of Object.entries(template)) {
        let answer = answers[key];
        if (answer == undefined)
            continue;

        result[key] = display ? answer : extractValueFromDisplay(answer);
    }

    return result;
}


export class ListVariableType implements VariableType, JournalEntryDependent {

    private readonly formId: string;
    private readonly fields: Record<string, boolean>;
    private readonly filters: JournalEntryFilter[];

    constructor(formId: string, fields: Record<string, boolean>, filters: JournalEntryFilter[]) {
        this.formId = formId;
        this.fields = fields;
        this.filters = filters;
    }

    async onJournalEntryAction(entry: JournalEntry, action: EntryAction, indices: VariableIndex[]): Promise<VariableIndexAction[]> {
        switch (action) {
            case EntryAction.CREATED:
                return this.onEntryCreated(entry, indices);
            case EntryAction.DELETED:
                return this.onEntryDeleted(entry, indices);
            case EntryAction.UPDATED:
                return this.onEntryUpdated(entry, indices);
        }
    }

    async onEntryUpdated(entry: JournalEntry, indices: VariableIndex[]): Promise<VariableIndexAction[]> {
        if (entry.formId != this.formId) return [];

        let filterOut = shouldFilterOutEntry(entry, this.filters);

        let actions: VariableIndexAction[] = [];
        for (let index of indices) {
            if (index.value.type != PrimitiveValueType.LIST)
                continue;

            let val = index.value.value;
            if (filterOut) {
                // Entry no longer matches filter, attempt to remove it from list
                index.value.value = val.filter(v =>
                    v.type == PrimitiveValueType.JOURNAL_ENTRY && v.value.id != entry.id);
            } else {
                let found = false;
                // Entry was updated, try to find and update it in the list
                for (let entries of val) {
                    if (entries.type == PrimitiveValueType.JOURNAL_ENTRY && entries.value.id == entry.id) {
                        found = true;
                        entries.value.value = extractFieldsFromAnswers(entry.answers, this.fields);
                        entries.value.timestamp = entry.timestamp;
                    }
                }

                // Entry went from being filtered to not filtered, add it to the list
                if (!found) {
                    index.value.value.push(pJournalEntry(entry.id, entry.timestamp,
                        extractFieldsFromAnswers(entry.answers, this.fields)));
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

        // Don't create list entries for entries that should be filtered
        if (shouldFilterOutEntry(entry, this.filters)) return [];

        let actions: VariableIndexAction[] = [];
        for (let index of indices) {
            if (index.value.type != PrimitiveValueType.LIST)
                continue;

            // Entry was created, add it to the list
            index.value.value
                .push(pJournalEntry(entry.id, entry.timestamp, extractFieldsFromAnswers(entry.answers, this.fields)));

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
                .filter(v => v.type != PrimitiveValueType.JOURNAL_ENTRY || v.value.id != entry.id)

            actions.push({
                type: VariableIndexActionType.UPDATE,
                index
            });
        }

        return actions;
    }


    async evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        let entries = await evaluator.getJournalEntriesInTimeRange(this.formId);
        let result: PrimitiveValue[] = [];
        for (let entry of entries) {
            if (shouldFilterOutEntry(entry, this.filters)) {
                continue;
            }

            let fields = extractFieldsFromAnswers(entry.answers, this.fields);
            result.push(pJournalEntry(entry.id, entry.timestamp, fields));
        }

        return pList(result);
    }

    getDependencies(): string[] {
        return [];
    }

    getFormDependencies(): string[] {
        return [this.formId];
    }

    getFormId(): string {
        return this.formId;
    }

    getType(): VariableTypeName {
        return VariableTypeName.LIST;
    }

    getFields(): Record<string, boolean> {
        return this.fields;
    }

    getFilters(): JournalEntryFilter[] {
        return this.filters;
    }

}
