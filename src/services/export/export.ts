import type {JournalService} from "@perfice/services/journal/journal";
import type {JournalEntry} from "@perfice/model/journal/journal";
import type {FormService} from "@perfice/services/form/form";
import type {FormQuestion, FormSnapshot} from "@perfice/model/form/form";
import {extractValueFromDisplay} from "../variable/types/list";
import {
    PrimitiveValueType,
    type PrimitiveValue,
    pString,
    pList,
    pBoolean,
    pNumber, pNull
} from "@perfice/model/primitive/primitive";
import {questionDataTypeRegistry} from "@perfice/model/form/data";
import Papa from 'papaparse';

export type ExportedPrimitive = string | number | boolean | null | ExportedPrimitive[];

export interface ExportEntry {
    timestamp: number;
    answers: ExportedPrimitive[];
}

export enum ExportFileType {
    CSV = "text/csv",
    JSON = "application/json"
}

export function importPrimitive(value: ExportedPrimitive): PrimitiveValue{
    switch (typeof value) {
        case "string":
            return pString(value);
        case "number":
            return pNumber(value);
        case "boolean":
            return pBoolean(value);
        case "object":
            if (Array.isArray(value)) {
                return pList(value.map(v => importPrimitive(v)));
            }

            // TODO: import objects?
            return pNull();
        default:
            return pNull();
    }
}

export function exportPrimitive(value: PrimitiveValue): ExportedPrimitive {
    switch (value.type) {
        case PrimitiveValueType.STRING:
            return value.value;
        case PrimitiveValueType.NUMBER:
            return value.value;
        case PrimitiveValueType.BOOLEAN:
            return value.value;
        case PrimitiveValueType.LIST:
            return value.value.map(v => exportPrimitive(v));
        case PrimitiveValueType.NULL:
            return null;
        default:
            return null;
    }
}

export class EntryExportService {

    private journalService: JournalService;
    private formService: FormService;

    constructor(journalService: JournalService, formService: FormService) {
        this.journalService = journalService;
        this.formService = formService;
    }

    private exportEntry(entry: JournalEntry, questions: FormQuestion[]): ExportEntry {
        let answers: ExportedPrimitive[] = [];

        for (let question of questions) {
            let answer = entry.answers[question.id];
            if (answer == null) {
                answers.push(null);
                continue
            }

            let value = extractValueFromDisplay(answer);
            let dataDefinition = questionDataTypeRegistry.getDefinition(question.dataType);
            if(dataDefinition == null) throw new Error("Invalid data type");

            let exported = dataDefinition.export(value);

            answers.push(exported ?? exportPrimitive(value));
        }

        return {
            timestamp: entry.timestamp,
            answers: answers
        };
    }

    async exportCsv(formId: string): Promise<string> {
        let exported = await this.exportEntries(formId);
        console.log(exported);
        return Papa.unparse(exported.map(e =>
            [e.timestamp.toString(), ...e.answers]));
    }

    async exportEntries(formId: string): Promise<ExportEntry[]> {
        let entries = await this.journalService.getEntriesByFormId(formId);

        let snapshots: Map<string, FormSnapshot> = new Map();
        let exported: ExportEntry[] = [];
        for (let entry of entries) {
            let existing = snapshots.get(entry.snapshotId);

            let snapshot: FormSnapshot;
            if (existing == null) {
                let data = await this.formService.getFormSnapshotById(entry.snapshotId);
                if (data == null) continue;

                snapshots.set(data.id, data);
                snapshot = data;
            } else {
                snapshot = existing;
            }

            exported.push(this.exportEntry(entry, snapshot.questions));
        }

        return exported;
    }

    async exportJson(formId: string): Promise<string> {
        let exported = await this.exportEntries(formId);
        return JSON.stringify(exported);
    }

}
