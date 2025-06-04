import type {Form, FormSnapshot, FormTemplate} from "@perfice/model/form/form";
import type {FormCollection, FormSnapshotCollection, FormTemplateCollection} from "@perfice/db/collections";
import type {SyncedTable} from "@perfice/services/sync/sync";

export class DexieFormCollection implements FormCollection {

    private table: SyncedTable<Form>;

    constructor(table: SyncedTable<Form>) {
        this.table = table;
    }

    async getForms(): Promise<Form[]> {
        return this.table.getAll();
    }

    async getFormById(id: string): Promise<Form | undefined> {
        return this.table.getById(id);
    }

    async createForm(form: Form): Promise<void> {
        await this.table.put(form);
    }

    async updateForm(form: Form): Promise<void> {
        await this.table.put(form);
    }

    async deleteFormById(id: string): Promise<void> {
        await this.table.deleteById(id);
    }

}

export class DexieFormSnapshotCollection implements FormSnapshotCollection {

    private table: SyncedTable<FormSnapshot>;

    constructor(table: SyncedTable<FormSnapshot>) {
        this.table = table;
    }

    async getFormSnapshots(): Promise<FormSnapshot[]> {
        return this.table.getAll();
    }

    async getFormSnapshotById(id: string): Promise<FormSnapshot | undefined> {
        return this.table.getById(id);
    }

    async createFormSnapshot(snapshot: FormSnapshot): Promise<void> {
        await this.table.put(snapshot);
    }

    async deleteFormSnapshotsByFormId(formId: string): Promise<void> {
        let snapshots = await this.table.where("formId").equals(formId).toArray();
        await this.table.deleteByIds(snapshots.map(s => s.id));
    }

    async updateFormSnapshot(snapshot: FormSnapshot): Promise<void> {
        await this.table.put(snapshot);
    }

}

export class DexieFormTemplateCollection implements FormTemplateCollection {

    private table: SyncedTable<FormTemplate>;

    constructor(table: SyncedTable<FormTemplate>) {
        this.table = table;
    }

    async createFormTemplate(template: FormTemplate): Promise<void> {
        await this.table.put(template);
    }

    async getTemplatesByFormId(formId: string): Promise<FormTemplate[]> {
        return this.table.where("formId").equals(formId).toArray();
    }

    async updateFormTemplate(template: FormTemplate): Promise<void> {
        await this.table.put(template);
    }

}
