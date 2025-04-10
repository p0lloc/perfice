import {AsyncStore} from "@perfice/stores/store";
import type {FormService} from "@perfice/services/form/form";
import type {Form, FormQuestion, FormSnapshot, FormTemplate} from "@perfice/model/form/form";
import { EntityObserverType } from "@perfice/services/observer";
import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
import type {FormTemplateService} from "@perfice/services/form/template";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
import type {TextOrDynamic} from "@perfice/model/variable/variable";

export type EntityFormCreateListener = (entityType: string, form: Form) => void;

export class FormStore extends AsyncStore<Form[]> {

    private formService: FormService;
    private formTemplateService: FormTemplateService;

    private entityCreateListeners: EntityFormCreateListener[] = [];

    constructor(formService: FormService, formTemplateService: FormTemplateService) {
        super(formService.getForms());
        this.formService = formService;
        this.formTemplateService = formTemplateService;
        this.formService.addObserver(EntityObserverType.CREATED, async (form) => await this.onFormCreated(form));
        this.formService.addObserver(EntityObserverType.UPDATED, async (form) => await this.onFormUpdated(form));
        this.formService.addObserver(EntityObserverType.DELETED, async (form) => await this.onFormDeleted(form));
    }

    async getFormById(id: string): Promise<Form | undefined> {
        let forms = await this.get();
        return forms.find(f => f.id == id);
    }

    async getFormSnapshotById(id: string): Promise<FormSnapshot | undefined> {
        return this.formService.getFormSnapshotById(id);
    }

    private async onFormCreated(form: Form) {
        this.updateResolved(v => [...v, form]);
    }

    private async onFormUpdated(form: Form) {
        this.updateResolved(v => updateIdentifiedInArray(v, form));
    }

    private async onFormDeleted(form: Form) {
        this.updateResolved(v => deleteIdentifiedInArray(v, form.id));
    }

    async updateForm(form: Form) {
        await this.formService.updateForm(form);
    }

    async getTemplatesByFormId(formId: string): Promise<FormTemplate[]> {
        return this.formTemplateService.getTemplatesByFormId(formId);
    }

    async createFormTemplate(formId: string, templateName: string, answers: Record<string, PrimitiveValue>) {
        await this.formTemplateService.createTemplate(formId, templateName, answers);
    }

    async updateFormTemplate(template: FormTemplate, templateName: string, answers: Record<string, PrimitiveValue>) {
        await this.formTemplateService.updateTemplate(template, templateName, answers);
    }

    async createForm(entityType: string, name: string, icon: string, questions: FormQuestion[], format: TextOrDynamic[]) {
        let form: Form = {
            id: crypto.randomUUID(),
            name,
            icon,
            questions,
            snapshotId: crypto.randomUUID(),
            format
        }

        await this.formService.createForm(form);
        this.entityCreateListeners.forEach(listener => listener(entityType, form));
    }

    addEntityFormCreateListener(listener: EntityFormCreateListener) {
        this.entityCreateListeners.push(listener);
    }
}
