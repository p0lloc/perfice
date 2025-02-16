import type { TagEntry } from "@perfice/model/journal/journal";
import {
    pTagEntry,
    type PrimitiveValue,
    pList,
    PrimitiveValueType,
} from "@perfice/model/primitive/primitive";
import {
    VariableTypeName,
    type VariableEvaluator,
    type VariableIndex,
    type VariableType
} from "@perfice/model/variable/variable";
import {
    EntryAction,
    type TagEntryDependent,
    type VariableIndexAction,
    VariableIndexActionType
} from "@perfice/services/variable/graph";

export class TagVariableType implements VariableType, TagEntryDependent {

    private readonly tagId: string;

    constructor(tagId: string) {
        this.tagId = tagId;
    }

    async evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        let entries = await evaluator.getTagEntriesInTimeRange(this.tagId);
        return pList(entries.map(e => pTagEntry(e.id, e.timestamp)));
    }

    async onEntryCreated(entry: TagEntry, indices: VariableIndex[]): Promise<VariableIndexAction[]> {
        let actions: VariableIndexAction[] = [];
        for (let index of indices) {
            if (index.value.type != PrimitiveValueType.LIST)
                continue;

            // Entry was created, add it to the list
            index.value.value
                .push(pTagEntry(entry.id, entry.timestamp));

            actions.push({
                type: VariableIndexActionType.UPDATE,
                index
            });
        }

        return actions;
    }

    async onEntryDeleted(entry: TagEntry, indices: VariableIndex[]): Promise<VariableIndexAction[]> {
        let actions: VariableIndexAction[] = [];
        for (let index of indices) {
            if (index.value.type != PrimitiveValueType.LIST)
                continue;

            // Entry was deleted, remove it from the list
            index.value.value = index.value.value
                .filter(v => v.type != PrimitiveValueType.TAG_ENTRY || v.value.id != entry.id)

            actions.push({
                type: VariableIndexActionType.UPDATE,
                index
            });
        }

        return actions;
    }

    async onTagEntryAction(entry: TagEntry, action: EntryAction, indices: VariableIndex[]): Promise<VariableIndexAction[]> {
        switch (action) {
            case EntryAction.CREATED:
                return this.onEntryCreated(entry, indices);
            case EntryAction.DELETED:
                return this.onEntryDeleted(entry, indices);
        }

        return [];
    }
    getTagDependencies(): string[] {
        return [this.tagId];
    }


    getDependencies(): string[] {
        return [];
    }

    getType(): VariableTypeName {
        return VariableTypeName.TAG;
    }

    getTagId(): string {
        return this.tagId;
    }

}
