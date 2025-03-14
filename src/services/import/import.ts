import type {JournalEntry} from "@perfice/model/journal/journal";
import type {JournalService} from "@perfice/services/journal/journal";
import {type Form, type FormQuestion} from "@perfice/model/form/form";
import {pDisplay, pList, pNull, type PrimitiveValue} from "@perfice/model/primitive/primitive";
import {formatAnswersIntoRepresentation} from "@perfice/model/trackable/ui";
import {importPrimitive, type ExportedPrimitive, ExportFileType} from "@perfice/services/export/export";
import {questionDataTypeRegistry} from "@perfice/model/form/data";
import {questionDisplayTypeRegistry} from "@perfice/model/form/display";
import Papa from "papaparse";

export class EntryImportService {

    private journalService: JournalService;

    constructor(journalService: JournalService) {
        this.journalService = journalService;
    }

    readFile(file: File, form: Form): Promise<JournalEntry[]> {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = (e) => {
                let target = e.target;
                if (target == null) {
                    return;
                }

                switch (file.type) {
                    case ExportFileType.CSV:
                        resolve(this.importCsv(target.result as string, form));
                        break;
                    case ExportFileType.JSON:
                        resolve(this.importJson(target.result as string, form));
                        break;
                    default:
                        reject(new Error("Unsupported file type"));
                        break;
                }
            };

            reader.onerror = e => reject(e);
            reader.readAsText(file);
        });
    }

    private async importCsv(text: string, form: Form): Promise<JournalEntry[]> {
        let result = Papa.parse<string[]>(text);
        let data: string[][] = result.data;

        let entries: JournalEntry[] = [];
        for (let data of result.data) {
            if (data.length < 2) return [];

            let timestamp = parseInt(data[0]);
        }

        return entries;
    }

    private async importJson(text: string, form: Form): Promise<JournalEntry[]> {
        let data = JSON.parse(text);
        if (!Array.isArray(data)) throw new Error("JSON should start with an array");

        let entries: JournalEntry[] = [];
        for (let entry of data) {
            entries.push(await this.parseJsonEntry(entry, form));
        }

        return entries;
    }

    private async parseAnswer(primitive: ExportedPrimitive | null, question: FormQuestion): Promise<PrimitiveValue> {

        let dataDefinition = questionDataTypeRegistry.getDefinition(question.dataType);
        if (dataDefinition == null) throw new Error("Invalid data type");

        let displayDefinition = questionDisplayTypeRegistry.getFieldByType(question.displayType);
        if (displayDefinition == null) throw new Error("Invalid display type");

        let answer: PrimitiveValue;
        if (displayDefinition.hasMultiple(question.displaySettings) && Array.isArray(primitive)) {
            let res: PrimitiveValue[] = [];
            for (let val of primitive) {
                if (val == null) continue;

                let parsed = dataDefinition.import(val) ?? importPrimitive(val);
                res.push(parsed);
            }

            answer = pList(res);
        } else {
            let parsed = dataDefinition.import(primitive) ?? importPrimitive(primitive);
            answer = parsed ?? pNull();
        }

        let display = displayDefinition.getDisplayValue(answer, question.displaySettings, question.dataSettings)

        return pDisplay(answer, display);
    }

    private async parseJsonAnswers(answers: (string | null)[], form: Form): Promise<Record<string, PrimitiveValue>> {
        let result: Record<string, PrimitiveValue> = {};
        for (let i = 0; i < form.questions.length && i < answers.length; i++) {
            let question = form.questions[i];
            let answer = answers[i];
            result[question.id] = await this.parseAnswer(answer, question);
        }

        return result;
    }

    private async parseJsonEntry(entry: Record<string, any>, form: Form): Promise<JournalEntry> {
        if (entry.timestamp == null || !Number.isFinite(entry.timestamp)) throw new Error("Entry should have timestamp");
        if (entry.answers == null || !Array.isArray(entry.answers)) throw new Error("Entry should have answers");

        let timestamp = entry.timestamp as number;
        let answers = await this.parseJsonAnswers(entry.answers, form);

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
    }
}
