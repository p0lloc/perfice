import type {PrimitiveValue} from "@perfice/model/primitive/primitive";

export interface JournalEntry {
    id: string;
    timestamp: number;

    formId: string;
    snapshotId: string;

    displayValue: string;
    answers: Record<string, PrimitiveValue>;
}

export interface TagEntry {
    id: string;
    timestamp: number;
    tagId: string;
}

export enum JournalEntityType {
    FORM_ENTRY,
    TAG_ENTRY
}

export type JournalEntity = {
    type: JournalEntityType.FORM_ENTRY,
    entry: JournalEntry
} | {
    type: JournalEntityType.TAG_ENTRY,
    entry: TagEntry
}

export function jeForm(entry: JournalEntry): JournalEntity {
    return {
        type: JournalEntityType.FORM_ENTRY,
        entry
    }
}

export function jeTag(entry: TagEntry): JournalEntity {
    return {
        type: JournalEntityType.TAG_ENTRY,
        entry
    }
}
