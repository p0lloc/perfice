import {constructAnswers, type ImportedEntry, type Importer} from "@perfice/services/import/formEntries/import";
import type {Form, FormQuestion} from "@perfice/model/form/form";
import Papa from "papaparse";
import {pList, pNull, type PrimitiveValue} from "@perfice/model/primitive/primitive";
import {questionDataTypeRegistry} from "@perfice/model/form/data";
import {questionDisplayTypeRegistry} from "@perfice/model/form/display";
import {EXPORT_LIST_SEPARATOR_STRING} from "../../export/formEntries/export";
import {convertValueToDisplay} from "@perfice/model/form/validation";

export class CsvImporter implements Importer {
    async import(text: string, form: Form): Promise<ImportedEntry[]> {
        let result = Papa.parse<string[]>(text);
        let data: string[][] = result.data.slice(1); // Skip column names

        let entries: ImportedEntry[] = [];
        for (let row of data) {
            if (data.length < 2) return [];

            let entry = this.parseCsvEntry(row, form);
            if (entry == null) continue;
            entries.push(entry);
        }

        return entries;
    }

    private parseCsvEntry(data: string[], form: Form): ImportedEntry | null {
        if (data.length < 2) return null;

        let timestamp = parseInt(data[0]);
        if (!isFinite(timestamp)) throw new Error("Invalid timestamp");

        let answers = this.parseCsvAnswers(data.slice(1), form);

        return {answers, timestamp};
    }

    private parseCsvAnswers(answers: string[], form: Form): Record<string, PrimitiveValue> {
        return constructAnswers(answers, form, this.parseCsvAnswer.bind(this));
    }

    private parseCsvAnswer(primitive: string, question: FormQuestion): PrimitiveValue {
        let dataDefinition = questionDataTypeRegistry.getDefinition(question.dataType);
        if (dataDefinition == null) throw new Error("Invalid data type");

        let displayDefinition = questionDisplayTypeRegistry.getFieldByType(question.displayType);
        if (displayDefinition == null) throw new Error("Invalid display type");


        let answer: PrimitiveValue;
        if (displayDefinition.hasMultiple(question.displaySettings)) {
            let parts = primitive.split(EXPORT_LIST_SEPARATOR_STRING);
            answer = pList(parts.map(v => dataDefinition?.importString?.(v) ?? dataDefinition.deserialize(v) ?? pNull()));
        } else {
            answer = dataDefinition?.importString?.(primitive) ?? dataDefinition.deserialize(primitive) ?? pNull();
        }

        return convertValueToDisplay(answer, question, dataDefinition, displayDefinition);
    }
}