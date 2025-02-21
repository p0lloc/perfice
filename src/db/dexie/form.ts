import type {EntityTable} from "dexie";
import type {Form, FormSnapshot, FormTemplate} from "@perfice/model/form/form";
import type {FormCollection, FormSnapshotCollection, FormTemplateCollection} from "@perfice/db/collections";

export class DexieFormCollection implements FormCollection {

    private table: EntityTable<Form, "id">;

    constructor(table: EntityTable<Form, "id">) {
        this.table = table;
    }

    async getForms(): Promise<Form[]> {
        return this.table.toArray();
    }

    async getFormById(id: string): Promise<Form | undefined> {
        return this.table.get(id);
    }

    async createForm(form: Form): Promise<void> {
        await this.table.add(form);
    }

    async updateForm(form: Form): Promise<void> {
        await this.table.put(form);
    }

    async deleteFormById(id: string): Promise<void> {
        await this.table.delete(id);
    }

}

export class DexieFormSnapshotCollection implements FormSnapshotCollection {

    private table: EntityTable<FormSnapshot, "id">;

    constructor(table: EntityTable<FormSnapshot, "id">) {
        this.table = table;
    }

    async getFormSnapshots(): Promise<FormSnapshot[]> {
        return this.table.toArray();
    }

    async getFormSnapshotById(id: string): Promise<FormSnapshot | undefined> {
        return this.table.get(id);
    }

    async createFormSnapshot(snapshot: FormSnapshot): Promise<void> {
        await this.table.add(snapshot);
    }

    async deleteFormSnapshotsByFormId(formId: string): Promise<void> {
        await this.table.where("formId").equals(formId).delete();
    }

    async updateFormSnapshot(snapshot: FormSnapshot): Promise<void> {
        await this.table.put(snapshot);
    }

}

export class DexieFormTemplateCollection implements FormTemplateCollection {

    private table: EntityTable<FormTemplate, "id">;

    constructor(table: EntityTable<FormTemplate, "id">) {
        this.table = table;
    }

    async createFormTemplate(template: FormTemplate): Promise<void> {
        await this.table.add(template);
    }

    async getTemplatesByFormId(formId: string): Promise<FormTemplate[]> {
        return this.table.where("formId").equals(formId).toArray();
    }

    async updateFormTemplate(template: FormTemplate): Promise<void> {
        await this.table.put(template);
    }

}
