import {
    EntryAction,
    type JournalEntryDependent,
    type VariableIndexAction,
    VariableIndexActionType
} from "@perfice/services/variable/graph";
import {
    VariableTypeName,
    type VariableEvaluator,
    type VariableIndex,
    type VariableType
} from "@perfice/model/variable/variable";
import {pJournalEntry, pNull, type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
import type {JournalEntry} from "@perfice/model/journal/journal";
import {extractFieldsFromAnswers} from "@perfice/services/variable/types/list";
import {type JournalEntryFilter, shouldFilterOutEntry} from "@perfice/services/variable/filtering";

export class LatestVariableType implements VariableType, JournalEntryDependent {

    private readonly formId: string;
    private readonly fields: Record<string, boolean>;
    private readonly filters: JournalEntryFilter[];

    constructor(formId: string, fields: Record<string, boolean>, filters: JournalEntryFilter[]) {
        this.formId = formId;
        this.fields = fields;
        this.filters = filters;
    }

    async evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        let result: JournalEntry | undefined = undefined;
        let entries = await evaluator.getJournalEntriesInTimeRange(this.formId);

        for (let entry of entries) {
            if (shouldFilterOutEntry(entry, this.filters)) continue;

            // If this entry is newer than the current one
            if (result == undefined || entry.timestamp > result.timestamp) {
                result = entry;
            }
        }

        if (result == null) return pNull();

        return this.entryToValue(result);
    }

    getDependencies(): string[] {
        return [];
    }

    getFormDependencies(): string[] {
        return [this.formId];
    }

    getType(): VariableTypeName {
        return VariableTypeName.LATEST;
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

    private entryToValue(entry: JournalEntry): PrimitiveValue {
        return pJournalEntry(entry.id, entry.timestamp, extractFieldsFromAnswers(entry.answers, this.fields))
    }

    async onEntryUpdated(entry: JournalEntry, indices: VariableIndex[]): Promise<VariableIndexAction[]> {
        let updates: VariableIndexAction[] = [];
        for (let index of indices) {
            if(!this.isIndexMatchingEntry(index, entry))
                continue;

            if (shouldFilterOutEntry(entry, this.filters)) {
                // Entry is suddenly filtered, we need to fetch all entries to get the new latest one
                // TODO: could we fetch the entries here instead of deleting the index?
                updates.push({
                    type: VariableIndexActionType.DELETE,
                    index: index
                })
            } else {
                updates.push({
                    type: VariableIndexActionType.UPDATE,
                    index: {
                        ...index,
                        value: this.entryToValue(entry)
                    }
                })
            }

        }
        return updates;
    }

    async onEntryCreated(entry: JournalEntry, indices: VariableIndex[]): Promise<VariableIndexAction[]> {
        if (shouldFilterOutEntry(entry, this.filters)) return [];
        let updates: VariableIndexAction[] = [];
        for (let index of indices) {
            let value = index.value;

            let shouldUpdate: boolean;
            if (value.type == PrimitiveValueType.NULL) {
                // If there was no previous entry, set it to the current one
                shouldUpdate = true;
            } else {
                if (value.type != PrimitiveValueType.JOURNAL_ENTRY)
                    continue;

                shouldUpdate = entry.timestamp > value.value.timestamp;
            }

            if(!shouldUpdate) continue;

            // Update to use current entry if it is newer than previous one
            updates.push({
                type: VariableIndexActionType.UPDATE,
                index: {
                    ...index,
                    value: this.entryToValue(entry)
                }
            })
        }

        return updates;
    }

    async onEntryDeleted(entry: JournalEntry, indices: VariableIndex[]): Promise<VariableIndexAction[]> {
        let updates: VariableIndexAction[] = [];
        for (let index of indices) {
            if (!this.isIndexMatchingEntry(index, entry)) continue;


            // Latest entry was deleted, delete the index
            updates.push({
                type: VariableIndexActionType.DELETE,
                index: index
            })
        }
        return updates;
    }

    private isIndexMatchingEntry(index: VariableIndex, entry: JournalEntry) {
        let value = index.value;

        if (value.type != PrimitiveValueType.JOURNAL_ENTRY)
            return false;

        return entry.id == value.value.id;
    }

    getFormId(): string {
        return this.formId;
    }

    getFields(): Record<string, boolean> {
        return this.fields;
    }

    getFilters(): JournalEntryFilter[] {
        return this.filters;
    }

}
