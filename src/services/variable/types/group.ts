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
import {
    extractDisplayFromDisplay,
    extractFieldsFromAnswers,
    extractValueFromDisplay
} from "@perfice/services/variable/types/list";
import {findArrayDifferences} from "@perfice/util/array";

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

    private getEntryGroups(entry: JournalEntry): string[] {
        const groupAnswer = entry.answers[this.groupBy];
        if (groupAnswer == undefined) {
            return [];
        }

        let value = extractValueFromDisplay(groupAnswer);
        let display = primitiveAsString(extractDisplayFromDisplay(groupAnswer));

        // We need to deduce if this is concerning multiple values
        // Hierarchy also uses a list for the path of the tree, so reasonably it wouldn't contain a comma
        let multiple = display.includes(",");

        if (value.type == PrimitiveValueType.LIST) {
            if (multiple) {
                return value.value.map(v => primitiveAsString(v));
            } else {
                if (value.value.length < 1) return []

                // Return the leaf node
                return [primitiveAsString(value.value[value.value.length - 1])];
            }
        } else {
            return [primitiveAsString(value)];
        }
    }

    async evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        let entries = await evaluator.getJournalEntriesInTimeRange(this.formId);

        let result: Map<string, PrimitiveValue[]> = new Map();
        for (let entry of entries) {
            if (shouldFilterOutEntry(entry, this.filters)) {
                continue;
            }

            const groups = this.getEntryGroups(entry);
            for (let group of groups) {
                let fields = extractFieldsFromAnswers(entry.answers, this.fields);
                let value = pJournalEntry(entry.id, entry.timestamp, fields);

                let existing = result.get(group);
                if (existing == undefined) {
                    result.set(group, [value]);
                } else {
                    existing.push(value);
                }
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

        const newGroup = this.getEntryGroups(entry);
        if (newGroup == null) {
            return [];
        }

        let filterOut = shouldFilterOutEntry(entry, this.filters);

        let actions: VariableIndexAction[] = [];
        for (let index of indices) {
            if (index.value.type != PrimitiveValueType.MAP)
                continue;

            let previousGroup: string[] = [];
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

                    previousGroup.push(group);
                    foundEntry = existing.value;
                }
            }

            let extractedFields = extractFieldsFromAnswers(entry.answers, this.fields);
            if (foundEntry != undefined && previousGroup != null) {
                foundEntry.value = extractedFields;
                foundEntry.timestamp = entry.timestamp;

                // Find which groups that the entry was added to and which groups it was removed from
                let {added, removed} = findArrayDifferences(previousGroup, newGroup);
                let primitiveEntry: PrimitiveValue =
                    {
                        type: PrimitiveValueType.JOURNAL_ENTRY,
                        value: foundEntry
                    };

                for (let add of added) {
                    let addGroup = index.value.value[add];
                    if (addGroup == undefined) {
                        // Create a new group
                        index.value.value[add] = pList([primitiveEntry]);
                    } else {
                        if (addGroup.type != PrimitiveValueType.LIST) continue;

                        // Add entry to existing group
                        addGroup.value.push(primitiveEntry);
                    }
                }

                for (let remove of removed) {
                    let removeGroup = index.value.value[remove];
                    if (removeGroup == undefined) continue;

                    if (removeGroup.type != PrimitiveValueType.LIST) continue;

                    removeGroup.value = removeGroup.value
                        .filter(v => v.type != PrimitiveValueType.JOURNAL_ENTRY || v.value.id != entry.id)
                }

                // if (newGroup != previousGroup) {
                //     // Entry was moved to a new group, remove it from the old group
                //     let existing = index.value.value[previousGroup];
                //     if (existing == undefined || existing.type != PrimitiveValueType.LIST) continue;
                //
                //     existing.value = existing.value
                //         .filter(v => v.type != PrimitiveValueType.JOURNAL_ENTRY || v.value.id != entry.id)
                //
                //     // Add it to the new group
                //     existing.value.push({
                //         type: PrimitiveValueType.JOURNAL_ENTRY,
                //         value: foundEntry
                //     });
                // }
            } else {
                // Entry went from being filtered to not filtered, add it to its group (potentially creating a new group)
                for (let group of newGroup) {
                    let existing = index.value.value[group];
                    let value = pJournalEntry(entry.id, entry.timestamp, extractedFields);
                    if (existing == undefined) {
                        index.value.value[group] = pList([value]);
                    } else {
                        if (existing.type != PrimitiveValueType.LIST) continue;

                        existing.value.push(value);
                    }
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

        const newGroup = this.getEntryGroups(entry);
        if (newGroup == null) {
            return [];
        }

        let actions: VariableIndexAction[] = [];
        for (let index of indices) {
            if (index.value.type != PrimitiveValueType.MAP)
                continue;

            let value = pJournalEntry(entry.id, entry.timestamp, extractFieldsFromAnswers(entry.answers, this.fields));
            for (let group of newGroup) {
                let existing = index.value.value[group];
                if (existing == undefined) {
                    index.value.value[group] = pList([value]);
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

    async onEntryDeleted(entry: JournalEntry, indices: VariableIndex[]): Promise<VariableIndexAction[]> {
        if (entry.formId != this.formId) return [];

        const newGroup = this.getEntryGroups(entry);
        if (newGroup == null) {
            return [];
        }

        let actions: VariableIndexAction[] = [];
        for (let index of indices) {
            if (index.value.type != PrimitiveValueType.MAP)
                continue;

            for (let group of newGroup) {
                let existing = index.value.value[group];
                if (existing == undefined) continue;

                if (existing.type != PrimitiveValueType.LIST) continue;

                // Entry was deleted, remove it from the list
                existing.value = existing.value
                    .filter(v => v.type != PrimitiveValueType.JOURNAL_ENTRY || v.value.id != entry.id)
            }

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