import type {EntityTable} from "dexie";
import type {Form, FormSnapshot} from "@perfice/model/form/form";
import type {FormCollection, FormSnapshotCollection} from "@perfice/db/collections";

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
