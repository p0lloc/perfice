import type {Form, FormQuestion} from "@perfice/model/form/form";
import {type ExportedPrimitive, importPrimitive} from "@perfice/services/export/formEntries/export";
import {pList, pNull, type PrimitiveValue} from "@perfice/model/primitive/primitive";
import {questionDataTypeRegistry} from "@perfice/model/form/data";
import {questionDisplayTypeRegistry} from "@perfice/model/form/display";
import {convertValueToDisplay} from "@perfice/model/form/validation";
import {constructAnswers, type ImportedEntry, type Importer} from "@perfice/services/import/formEntries/import";

export class JsonImporter implements Importer {

    async import(text: string, form: Form): Promise<ImportedEntry[]> {
        let data = JSON.parse(text);
        if (typeof data != "object") throw new Error("JSON should start with an object");

        if (!Array.isArray(data.entries)) throw new Error("JSON should contain an array of entries");

        let entries: ImportedEntry[] = [];
        for (let entry of data.entries) {
            entries.push(this.parseJsonEntry(entry, form));
        }

        return entries;
    }

    private parseJsonAnswer(primitive: ExportedPrimitive | null, question: FormQuestion): PrimitiveValue {

        let dataDefinition = questionDataTypeRegistry.getDefinition(question.dataType);
        if (dataDefinition == null) throw new Error("Invalid data type");

        let displayDefinition = questionDisplayTypeRegistry.getFieldByType(question.displayType);
        if (displayDefinition == null) throw new Error("Invalid display type");

        let answer: PrimitiveValue;
        if (displayDefinition.hasMultiple(question.displaySettings) && Array.isArray(primitive)) {
            let res: PrimitiveValue[] = [];
            for (let val of primitive) {
                if (val == null) continue;

                let parsed = dataDefinition.importPrimitive(val) ?? importPrimitive(val);
                res.push(parsed);
            }

            answer = pList(res);
        } else {
            let parsed = dataDefinition.importPrimitive(primitive) ?? importPrimitive(primitive);
            answer = parsed ?? pNull();
        }

        return convertValueToDisplay(answer, question, dataDefinition, displayDefinition);
    }

    private parseJsonAnswers(answers: ExportedPrimitive[], form: Form): Record<string, PrimitiveValue> {
        return constructAnswers(answers, form, this.parseJsonAnswer.bind(this));
    }

    private parseJsonEntry(entry: Record<string, any>, form: Form): ImportedEntry {
        if (entry.timestamp == null || !Number.isFinite(entry.timestamp)) throw new Error("Entry should have timestamp");
        if (entry.answers == null || !Array.isArray(entry.answers)) throw new Error("Entry should have answers");

        let timestamp = entry.timestamp as number;
        let answers = this.parseJsonAnswers(entry.answers, form);

        return {answers, timestamp};
    }
}