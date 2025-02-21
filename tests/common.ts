import {JournalEntry} from "../src/model/journal/journal";
import {pDisplay, PrimitiveValue} from "../src/model/primitive/primitive";

export function mockEntry(id: string, formId: string, answers: Record<string, PrimitiveValue>, timestamp: number = 0): JournalEntry {
    return {
        id,
        formId,
        name: "",
        icon: "",
        snapshotId: "",
        timestamp,
        displayValue: "",
        answers: Object.fromEntries(Object.entries(answers)
            .map(([k, v]) => [k, pDisplay(v, v)]))
    }
}
