import type {JournalEntry} from "@perfice/model/journal/journal";
import {
    comparePrimitivesLoosely,
    pJournalEntry,
    pList, primitiveAsNumber,
    type PrimitiveValue,
    PrimitiveValueType,
} from "@perfice/model/primitive/primitive";
import {
    type VariableEvaluator,
    type VariableIndex,
    type VariableType,
    VariableTypeName
} from "@perfice/model/variable/variable";
import {
    VariableIndexActionType,
    type VariableIndexAction, type JournalEntryDependent, EntryAction,
} from "@perfice/services/variable/graph";

export function extractValueFromDisplay(p: PrimitiveValue): PrimitiveValue {
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

        result[key] = display ? answer : extractValueFromDisplay(answer);
    }

    return result;
}

export enum FilterComparisonOperator {
    EQUAL = "EQUAL",
    NOT_EQUAL = "NOT_EQUAL",
    GREATER_THAN = "GREATER_THAN",
    GREATER_THAN_EQUAL = "GREATER_THAN_EQUAL",
    LESS_THAN = "LESS_THAN",
    LESS_THAN_EQUAL = "LESS_THAN_EQUAL",
    IN = "IN",
    NOT_IN = "NOT_IN",
}

export type NumberFilterComparisonOperator =
    FilterComparisonOperator.GREATER_THAN |
    FilterComparisonOperator.GREATER_THAN_EQUAL |
    FilterComparisonOperator.LESS_THAN |
    FilterComparisonOperator.LESS_THAN_EQUAL;

export interface ListVariableFilter {
    id: string;
    field: string;
    operator: FilterComparisonOperator;
    value: PrimitiveValue;
}

export class ListVariableType implements VariableType, JournalEntryDependent {

    private readonly formId: string;
    private readonly fields: Record<string, boolean>;
    private readonly filters: ListVariableFilter[];

    constructor(formId: string, fields: Record<string, boolean>, filters: ListVariableFilter[]) {
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

        let actions: VariableIndexAction[] = [];
        for (let index of indices) {
            if (index.value.type != PrimitiveValueType.LIST)
                continue;

            let val = index.value.value;
            if(this.shouldFilterEntry(entry)){
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
                if(!found) {
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
        if(this.shouldFilterEntry(entry)) return [];

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

    private isInList(value: PrimitiveValue, filter: ListVariableFilter): boolean {
        if (filter.value.type != PrimitiveValueType.LIST) return false;

        return filter.value.value.some(v => comparePrimitivesLoosely(value, v));
    }

    private isFilterMet(value: PrimitiveValue, filter: ListVariableFilter): boolean {
        switch (filter.operator) {
            case FilterComparisonOperator.EQUAL:
            case FilterComparisonOperator.NOT_EQUAL:
                let comparison = comparePrimitivesLoosely(value, filter.value);
                return (filter.operator == FilterComparisonOperator.EQUAL) ? comparison : !comparison;
            case FilterComparisonOperator.GREATER_THAN:
            case FilterComparisonOperator.GREATER_THAN_EQUAL:
            case FilterComparisonOperator.LESS_THAN:
            case FilterComparisonOperator.LESS_THAN_EQUAL:
                return this.isNumberFilterMet(value, filter, filter.operator);
            case FilterComparisonOperator.IN:
                return this.isInList(value, filter);
            case FilterComparisonOperator.NOT_IN:
                return !this.isInList(value, filter);
        }
    }

    private isNumberFilterMet(first: PrimitiveValue, filter: ListVariableFilter, operator: NumberFilterComparisonOperator): boolean {
        let value = primitiveAsNumber(first);
        let filterValue = primitiveAsNumber(filter.value);

        switch (operator) {
            case FilterComparisonOperator.GREATER_THAN:
                return value > filterValue;
            case FilterComparisonOperator.GREATER_THAN_EQUAL:
                return value >= filterValue;
            case FilterComparisonOperator.LESS_THAN:
                return value < filterValue;
            case FilterComparisonOperator.LESS_THAN_EQUAL:
                return value <= filterValue;
        }
    }

    private shouldFilterEntry(entry: JournalEntry): boolean {
        for (let filter of this.filters) {
            let answer = entry.answers[filter.field];
            if (answer == undefined) return false;

            if (!this.isFilterMet(extractValueFromDisplay(answer), filter)) return true;
        }
        return false;
    }

    async evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        let entries = await evaluator.getJournalEntriesInTimeRange(this.formId);
        let result: PrimitiveValue[] = [];
        for (let entry of entries) {
            if (this.shouldFilterEntry(entry)) {
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

    getFields(): Record<string, boolean> {
        return this.fields;
    }

    getType(): VariableTypeName {
        return VariableTypeName.LIST;
    }

    getFilters(): ListVariableFilter[] {
        return this.filters;
    }

}
