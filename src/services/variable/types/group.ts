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
    VariableIndexActionType
} from "@perfice/services/variable/graph";
import {type JournalEntryFilter, shouldFilterOutEntry} from "@perfice/services/variable/filtering";
import type {JournalEntry} from "@perfice/model/journal/journal";
import {
    type JournalEntryValue,
    pJournalEntry,
    pList,
    pMap,
    primitiveAsString,
    type PrimitiveValue,
    PrimitiveValueType
} from "@perfice/model/primitive/primitive";
import {extractFieldsFromAnswers, extractValueFromDisplay} from "@perfice/services/variable/types/list";

export class GroupVariableType implements VariableType, JournalEntryDependent {

    private readonly formId: string;
    private readonly fields: Record<string, boolean>;
    private readonly groupBy: string;
    private readonly filters: JournalEntryFilter[];

    constructor(formId: string, fields: Record<string, boolean>, groupBy: string, filters: JournalEntryFilter[]) {
        this.formId = formId;
        this.fields = fields;
        this.groupBy = groupBy;
        this.filters = filters;
    }

    private getEntryGroup(entry: JournalEntry): string | null {
        const groupAnswer = entry.answers[this.groupBy];
        if (groupAnswer == undefined) {
            return null;
        }

        return primitiveAsString(extractValueFromDisplay(groupAnswer));
    }

    async evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        let entries = await evaluator.getJournalEntriesInTimeRange(this.formId);

        let result: Map<string, PrimitiveValue[]> = new Map();
        for (let entry of entries) {
            if (shouldFilterOutEntry(entry, this.filters)) {
                continue;
            }

            const group = this.getEntryGroup(entry);
            if (group == null) {
                continue;
            }

            let fields = extractFieldsFromAnswers(entry.answers, this.fields);
            let value = pJournalEntry(entry.id, entry.timestamp, fields);

            let existing = result.get(group);
            if (existing == undefined) {
                result.set(group, [value]);
            } else {
                existing.push(value);
            }
        }

        let object: Record<string, PrimitiveValue> = Object.fromEntries(
            result.entries().map(([k, v]) => [k, pList(v)]).toArray())

        return pMap(object);
    }

    getDependencies(): string[] {
        return [];
    }

    getType(): VariableTypeName {
        return VariableTypeName.GROUP;
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

        const newGroup = this.getEntryGroup(entry);
        if (newGroup == null) {
            return [];
        }

        let filterOut = shouldFilterOutEntry(entry, this.filters);

        let actions: VariableIndexAction[] = [];
        for (let index of indices) {
            if (index.value.type != PrimitiveValueType.MAP)
                continue;

            let previousGroup: string | null = null;
            let foundEntry: JournalEntryValue | undefined;

            // We must loop through all groups to find the entry
            // Since it might have potentially moved between groups
            for (let [group, values] of Object.entries(index.value.value)) {
                if (values.type != PrimitiveValueType.LIST) continue;

                if (filterOut) {
                    values.value = values.value.filter(v =>
                        v.type == PrimitiveValueType.JOURNAL_ENTRY && v.value.id != entry.id);
                } else {
                    let existing = values.value.find(v => v.type == PrimitiveValueType.JOURNAL_ENTRY
                        && v.value.id == entry.id);

                    if (existing == undefined || existing.type != PrimitiveValueType.JOURNAL_ENTRY) continue;

                    previousGroup = group;
                    foundEntry = existing.value;
                    break;
                }
            }

            let extractedFields = extractFieldsFromAnswers(entry.answers, this.fields);
            if (foundEntry != undefined && previousGroup != null) {
                foundEntry.value = extractedFields;
                foundEntry.timestamp = entry.timestamp;

                if (newGroup != previousGroup) {
                    // Entry was moved to a new group, remove it from the old group
                    let existing = index.value.value[previousGroup];
                    if (existing == undefined || existing.type != PrimitiveValueType.LIST) continue;

                    existing.value = existing.value
                        .filter(v => v.type != PrimitiveValueType.JOURNAL_ENTRY || v.value.id != entry.id)

                    // Add it to the new group
                    existing.value.push({
                        type: PrimitiveValueType.JOURNAL_ENTRY,
                        value: foundEntry
                    });
                }
            } else {
                // Entry went from being filtered to not filtered, add it to its group (potentially creating a new group)
                let existing = index.value.value[newGroup];
                let value = pJournalEntry(entry.id, entry.timestamp, extractedFields);
                if (existing == undefined) {
                    index.value.value[newGroup] = pList([value]);
                } else {
                    if (existing.type != PrimitiveValueType.LIST) continue;

                    existing.value.push(value);
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

        const group = this.getEntryGroup(entry);
        if (group == null) {
            return [];
        }

        let actions: VariableIndexAction[] = [];
        for (let index of indices) {
            if (index.value.type != PrimitiveValueType.MAP)
                continue;

            let value = pJournalEntry(entry.id, entry.timestamp, extractFieldsFromAnswers(entry.answers, this.fields));
            let existing = index.value.value[group];
            if (existing == undefined) {
                index.value.value[group] = pList([value]);
            } else {
                if (existing.type != PrimitiveValueType.LIST) continue;

                existing.value.push(value);
            }

            actions.push({
                type: VariableIndexActionType.UPDATE,
                index
            });
        }

        return actions;
    }

    async onEntryDeleted(entry: JournalEntry, indices: VariableIndex[]): Promise<VariableIndexAction[]> {
        if (entry.formId != this.formId) return [];

        const group = this.getEntryGroup(entry);
        if (group == null) {
            return [];
        }

        let actions: VariableIndexAction[] = [];
        for (let index of indices) {
            if (index.value.type != PrimitiveValueType.MAP)
                continue;

            let existing = index.value.value[group];
            if (existing == undefined) continue;

            if (existing.type != PrimitiveValueType.LIST) continue;

            // Entry was deleted, remove it from the list
            existing.value = existing.value
                .filter(v => v.type != PrimitiveValueType.JOURNAL_ENTRY || v.value.id != entry.id)

            actions.push({
                type: VariableIndexActionType.UPDATE,
                index
            });
        }

        return actions;
    }

    getFormDependencies(): string[] {
        return [this.formId];
    }

    getFields(): Record<string, boolean> {
        return this.fields;
    }

    getFilters(): JournalEntryFilter[] {
        return this.filters;
    }

    getGroupBy(): string {
        return this.groupBy;
    }

    getFormId(): string {
        return this.formId;
    }

}