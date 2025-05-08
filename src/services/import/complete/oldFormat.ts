import type {Table} from "dexie";
import type {TagService} from "@perfice/services/tag/tag";
import type {TagCategoryService} from "@perfice/services/tag/category";
import type {TrackableService} from "@perfice/services/trackable/trackable";
import type {TrackableCategoryService} from "@perfice/services/trackable/category";
import {type FormQuestion, FormQuestionDataType, FormQuestionDisplayType} from "@perfice/model/form/form";
import {
    deserializeAndFormatValueAsDataType,
    type FormQuestionDataSettings,
    questionDataTypeRegistry
} from "@perfice/model/form/data";
import type {FormQuestionDisplaySettings} from "@perfice/model/form/display";
import {type PrimitiveValue, pString} from "@perfice/model/primitive/primitive";
import {EMOJIS} from "@perfice/components/base/icon/icons";
import type {FormService} from "@perfice/services/form/form";
import type {TextOrDynamic} from "@perfice/model/variable/variable";
import type {JournalEntry, TagEntry} from "@perfice/model/journal/journal";
import {importPrimitive} from "@perfice/services/export/formEntries/export";

export interface OldImportFormat {
    collections: Record<string, any[]>;
}

export interface OldForm {
    id: string;
    name: string;
    icon: string;
    questions: OldFormQuestion[];
    primaryQuestion: string;
    snapshotId: string;
}

export enum OldFormQuestionDisplayType {
    INPUT = "INPUT",
    SELECT = "SELECT",
    TEXT_AREA = "TEXT_AREA",
    RICH_TEXT = "RICH_TEXT",
    RANGE = "RANGE",
}

export enum OldFormQuestionType {
    TEXT = "TEXT",
    RICH_TEXT = "RICH_TEXT",
    NUMBER = "NUMBER",
    DATE = "DATE",
    TIME_ELAPSED = "TIME_ELAPSED",
    DATE_TIME = "DATE_TIME",
    TIME_OF_DAY = "TIME_OF_DAY",
    BOOLEAN = "BOOLEAN",
}

export interface OldFormSnapshot {
    id: string;
    formId: string;
    questions: OldFormQuestion[];
}

export interface OldFormQuestion {
    id: string;
    type: OldFormQuestionType;
    name: string;
    unit: string | null;
    required: boolean;
    multiple: boolean;

    displayType: OldFormQuestionDisplayType;
    dataSettings: any;
    displaySettings: any;
}

export interface OldSelectFormDisplaySettings {
    options: OldSelectFormOption[];
}

export interface OldSelectFormOption {
    id: string;
    text: string;
    value: string;
}

export interface OldPrimaryAnswerData {
    questionId: string;
    type: OldFormQuestionType;
    unit: string | null;
}

export interface OldJournalEntryFormData {
    icon: string;
    answers: Record<string, any>;
    formId: string;
    snapshotId: string;
}

export enum OldEntityType {
    HABIT = "HABIT",
    TAG = "TAG",
    MEASUREMENT = "MEASUREMENT",
}

export interface OldEntityContext {
    id: string;
    type: OldEntityType;
}

export interface OldJournalEntry {
    id: string;
    name: string;
    context: OldEntityContext;
    primary: OldPrimaryAnswerData | null;
    formData: OldJournalEntryFormData | null;
    timestamp: number;
}

export interface OldTrackable {
    id: string;
    name: string;
    icon: string;

    formId: string;
    questionId: string;
    categoryId: string | null;
}

export interface OldHabit {
    id: string;
    name: string;
    icon: string;
    formId: string;
}

export class OldFormatImporter {

    private readonly tables: Record<string, Table>;

    private tagService: TagService;
    private tagCategoryService: TagCategoryService;
    private trackableService: TrackableService;
    private trackableCategoryService: TrackableCategoryService;
    private formService: FormService;

    constructor(tables: Record<string, Table>, tagService: TagService,
                tagCategoryService: TagCategoryService,
                trackableService: TrackableService,
                trackableCategoryService: TrackableCategoryService,
                formService: FormService,
    ) {
        this.tables = tables;
        this.tagService = tagService;
        this.tagCategoryService = tagCategoryService;
        this.trackableService = trackableService;
        this.trackableCategoryService = trackableCategoryService;
        this.formService = formService;
    }

    async importCollection(data: OldImportFormat, key: string, callback: (value: any) => Promise<void>) {
        for (const entity of data.collections[key] ?? []) {
            await callback(entity);
        }
    }

    async import(data: OldImportFormat) {
        for (const table of Object.values(this.tables)) {
            await table.clear();
        }

        await this.importCollection(data, "tags", async (e) => await this.importTag(e));
        await this.importCollection(data, "tag_categories", async (e) => await this.importTagCategory(e));
        await this.importCollection(data, "measurement_categories", async (e) => await this.importTrackableCategory(e));
        await this.importCollection(data, "forms", async (e) => await this.importForm(e));
        await this.importCollection(data, "measurements", async (e) => await this.importTrackable(e));

        let habitCollection = data.collections?.habits ?? [];
        let habitCategoryId = "";
        if (habitCollection.length > 0) {
            habitCategoryId = (await this.trackableCategoryService.createCategory("Habits")).id;
        }

        for (const tag of habitCollection) {
            await this.importHabit(tag, habitCategoryId);
        }

        await this.importCollection(data, "form_snapshots", async (e) => await this.importFormSnapshot(e));
        await this.importCollection(data, "journal_entries", async (e) => await this.importJournalEntry(e));
    }

    private constructDisplayFromAllAnswers(answers: Record<string, any>): string {
        return Object.values(answers)
            .map(v => v.toString())
            .join(" ");
    }

    private async importJournalEntry(entry: OldJournalEntry) {
        if (entry.context.type == OldEntityType.TAG) {
            const tagEntry: TagEntry = {
                id: crypto.randomUUID(),
                timestamp: entry.timestamp,
                tagId: entry.context.id,
            };

            await this.tables["tagEntries"].put(tagEntry);
            return;
        }

        let formData = entry.formData;
        let primaryData = entry.primary;
        if (formData == null) return;

        let displayValue: string = "";
        if (primaryData == null) {
            displayValue = this.constructDisplayFromAllAnswers(formData.answers);
        } else {
            let answer: any = formData.answers[primaryData.questionId];
            if (answer != null) {
                answer = deserializeAndFormatValueAsDataType(answer, primaryData.type);
                if (primaryData.unit != null) {
                    answer = answer + " " + primaryData.unit;
                }

                displayValue = answer;
            } else {
                displayValue = this.constructDisplayFromAllAnswers(formData.answers);
            }
        }

        let answers: Record<string, PrimitiveValue> = Object.fromEntries(Object.entries(formData.answers)
            .map(([key, value]) => [key, importPrimitive(value)]));

        let newEntry: JournalEntry = {
            id: crypto.randomUUID(),
            timestamp: entry.timestamp,
            formId: formData.formId,
            snapshotId: formData.snapshotId,
            displayValue,
            answers,
        };

        await this.tables["entries"].put(newEntry);
    }

    private async importFormSnapshot(snapshot: OldFormSnapshot) {
        let form = await this.formService.getFormById(snapshot.formId);
        if (form == null) return;

        // It's not possible to know if this snapshot contains the same questions as the associated form
        // Just use the first question as the format
        let format: TextOrDynamic[] = [];
        if (snapshot.questions.length > 0) {
            format.push({
                dynamic: true,
                value: snapshot.questions[0].id
            });
        }

        await this.formService.createStandaloneFormSnapshot({
            id: snapshot.id,
            formId: snapshot.formId,
            questions: snapshot.questions.map(v => this.transformFormQuestion(v)),
            format: format,
        });
    }

    private async importHabit(measurement: OldHabit, habitCategoryId: string) {
        let form = await this.formService.getFormById(measurement.formId);
        if (form == null) return;

        await this.trackableService.createTrackableFromForm(form, habitCategoryId);
    }

    private async importTrackable(measurement: OldTrackable) {
        let form = await this.formService.getFormById(measurement.formId);
        if (form == null) return;

        await this.trackableService.createTrackableFromForm(form, measurement.categoryId);
    }

    private async importTagCategory(category: any) {
        await this.tagCategoryService.createCategoryWithIdAndName(category.id, category.name);
    }

    private async importTrackableCategory(category: any) {
        await this.trackableCategoryService.createCategoryWithIdAndName(category.id, category.name);
    }

    private findEmoji(name: string): string {
        for (let emoji of EMOJIS) {
            if (emoji.annotation.toLowerCase().includes(name) ||
                emoji.tags.toLowerCase().includes(name)) return emoji.emoji;
        }

        return "";
    }

    private getFormatFromForm(form: OldForm): TextOrDynamic[] {
        let primaryQuestion = form.questions.find(v => v.id == form.primaryQuestion);
        if (primaryQuestion != null) {
            return [{
                dynamic: true,
                value: primaryQuestion.id
            }];
        } else {
            if (form.questions.length > 0) {
                return [{
                    dynamic: true,
                    value: form.questions[0].id
                }];
            }
        }

        return [];
    }

    private async importForm(form: OldForm) {
        let questions = form.questions.map(v => this.transformFormQuestion(v));

        await this.formService.createForm({
            id: form.id,
            name: form.name,
            icon: this.findEmoji(form.icon),
            format: this.getFormatFromForm(form),
            snapshotId: crypto.randomUUID(),
            questions,
        })
    }

    private transformDataSettings(type: OldFormQuestionType, dataSettings: any): FormQuestionDataSettings {
        let settings: any = dataSettings;
        switch (type) {
            case OldFormQuestionType.TEXT: {
                settings = {
                    minLength: null,
                    maxLength: dataSettings.maxLength ?? null,
                };
                break;
            }
            case OldFormQuestionType.NUMBER: {
                let min = dataSettings.min;
                let max = dataSettings.max;
                settings = {
                    min: min != null && min > 0 ? min : null,
                    max: max != null && max > 0 ? max : null,
                };
                break;
            }
        }

        return {
            dataType: this.transformFormQuestionType(type),
            dataSettings: settings
        }
    }

    private transformDisplaySettings(displayType: OldFormQuestionDisplayType, dataType: OldFormQuestionType, displaySettings: any): FormQuestionDisplaySettings {
        let settings: any = displaySettings;
        switch (displayType) {
            case OldFormQuestionDisplayType.RANGE: {
                settings = {
                    step: displaySettings.step ?? 1,
                }
                break;
            }

            case OldFormQuestionDisplayType.SELECT: {
                let oldSettings = displaySettings as OldSelectFormDisplaySettings;

                let dataDefinition = questionDataTypeRegistry.getDefinition(this.transformFormQuestionType(dataType));
                if (dataDefinition == null) throw new Error("Invalid data type");

                settings = {
                    multiple: false,
                    options: oldSettings.options.map(v => {
                        return {
                            id: v.id,
                            text: v.text.toString(),
                            value: dataDefinition.deserialize(v.value) ?? pString(""),
                            icon: null,
                            iconAndText: false
                        }
                    }),
                    grid: null
                };
                break;
            }
        }

        return {
            displayType: this.transformFormDisplayType(displayType),
            displaySettings: settings
        }
    }

    private transformFormQuestion(question: OldFormQuestion): FormQuestion {
        return {
            id: question.id,
            name: question.name,
            unit: question.unit,
            defaultValue: null,
            ...this.transformDataSettings(question.type, question.dataSettings),
            ...this.transformDisplaySettings(question.displayType, question.type, question.displaySettings),
        }
    }

    private transformFormDisplayType(displayType: OldFormQuestionDisplayType): FormQuestionDisplayType {
        switch (displayType) {
            case OldFormQuestionDisplayType.INPUT:
                return FormQuestionDisplayType.INPUT;
            case OldFormQuestionDisplayType.SELECT:
                return FormQuestionDisplayType.SELECT;
            case OldFormQuestionDisplayType.TEXT_AREA:
                return FormQuestionDisplayType.TEXT_AREA;
            case OldFormQuestionDisplayType.RICH_TEXT:
                return FormQuestionDisplayType.RICH_INPUT;
            case OldFormQuestionDisplayType.RANGE:
                return FormQuestionDisplayType.RANGE;
        }
    }

    private transformFormQuestionType(question: OldFormQuestionType): FormQuestionDataType {
        switch (question) {
            case OldFormQuestionType.TEXT:
                return FormQuestionDataType.TEXT;
            case OldFormQuestionType.RICH_TEXT:
                return FormQuestionDataType.RICH_TEXT;
            case OldFormQuestionType.NUMBER:
                return FormQuestionDataType.NUMBER;
            case OldFormQuestionType.DATE:
                return FormQuestionDataType.DATE;
            case OldFormQuestionType.TIME_ELAPSED:
                return FormQuestionDataType.TIME_ELAPSED;
            case OldFormQuestionType.DATE_TIME:
                return FormQuestionDataType.DATE_TIME;
            case OldFormQuestionType.TIME_OF_DAY:
                return FormQuestionDataType.TIME_OF_DAY;
            case OldFormQuestionType.BOOLEAN:
                return FormQuestionDataType.BOOLEAN;
        }
    }

    private async importTag(tag: any) {
        await this.tagService.createTag(tag.name, tag.categoryId, tag.id);
    }

}