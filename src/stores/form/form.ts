import {AsyncStore} from "@perfice/stores/store";
import type {FormService} from "@perfice/services/form/form";
import type {Form, FormSnapshot} from "@perfice/model/form/form";
import { EntityObserverType } from "@perfice/services/observer";
import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";

export class FormStore extends AsyncStore<Form[]> {

    private formService: FormService;

    constructor(formService: FormService) {
        super(formService.getForms());
        this.formService = formService;
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
}
