import type {EntityTable} from "dexie";
import type {Form} from "@perfice/model/form/form";

export class DexieFormCollection {

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
