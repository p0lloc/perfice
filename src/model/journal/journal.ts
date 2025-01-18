import type {PrimitiveValue} from "@perfice/model/primitive/primitive";

export interface JournalEntry {
    id: string;
    timestamp: number;
    formId: string;
    answers: Record<string, PrimitiveValue>;
}
