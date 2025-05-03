import type {JournalEntry} from "@perfice/model/journal/journal";
import type {JournalService} from "@perfice/services/journal/journal";
import {type Form, type FormQuestion} from "@perfice/model/form/form";
import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
import {ExportFileType} from "@perfice/services/export/formEntries/export";
import {CsvImporter} from "@perfice/services/import/formEntries/csv";
import {formatAnswersIntoRepresentation} from "@perfice/model/trackable/ui";
import {JsonImporter} from "@perfice/services/import/formEntries/json";
import type {VariableService} from "@perfice/services/variable/variable";

export interface ImportedEntry {
    timestamp: number;
    answers: Record<string, PrimitiveValue>;
}

export interface Importer {
    import(data: string, form: Form): Promise<ImportedEntry[]>;
}


export function readTextFile<T>(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = async (e) => {
            let target = e.target;
            if (target == null) {
                return;
            }

            resolve(target.result as string);
        };

        reader.onerror = e => reject(e);
        reader.readAsText(file);
    });
}

export class EntryImportService {

    private journalService: JournalService;
    private importers: Map<ExportFileType, Importer> = new Map();
    private variableService: VariableService;

    constructor(journalService: JournalService, variableService: VariableService) {
        this.journalService = journalService;
        this.variableService = variableService;
        this.importers.set(ExportFileType.CSV, new CsvImporter());
        this.importers.set(ExportFileType.JSON, new JsonImporter());
    }

    async readFile(file: File, form: Form): Promise<JournalEntry[]> {
        let text = await readTextFile(file);
        let importer = this.importers.get(file.type as ExportFileType);
        if (importer == null) {
            throw new Error("Unsupported file type");
        }

        let entries: JournalEntry[] = [];
        for (let entry of await importer.import(text, form)) {
            entries.push(this.constructEntry(entry.answers, entry.timestamp, form));
        }

        return entries;
    }

    private constructEntry(answers: Record<string, PrimitiveValue>, timestamp: number, form: Form): JournalEntry {
        return {
            id: crypto.randomUUID(),
            formId: form.id,
            snapshotId: form.snapshotId,
            answers: answers,
            timestamp,
            displayValue: formatAnswersIntoRepresentation(answers, form.format)
        };
    }

    async finishImport(entries: JournalEntry[], overwrite: boolean) {
        await this.journalService.import(entries, overwrite);
        await this.variableService.onFormEntriesImported(new Set(entries.map(e => e.formId)));
    }
}

export function constructAnswers<T>(answers: T[], form: Form, deserializer: (v: T, question: FormQuestion) => PrimitiveValue): Record<string, PrimitiveValue> {
    let result: Record<string, PrimitiveValue> = {};
    for (let i = 0; i < form.questions.length && i < answers.length; i++) {
        let question = form.questions[i];
        let answer = answers[i];
        result[question.id] = deserializer(answer, question);
    }

    return result;
}
