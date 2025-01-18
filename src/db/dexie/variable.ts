import type {VariableCollection} from "@perfice/db/collections";
import {type EntityTable} from "dexie";
import type {StoredVariable} from "@perfice/model/variable/variable";

export class DexieVariableCollection implements VariableCollection {

    private table: EntityTable<StoredVariable, "id">;

    constructor(table: EntityTable<StoredVariable, "id">) {
        this.table = table;
    }

    getVariableById(id: string): Promise<StoredVariable | undefined> {
        return this.table.get(id);
    }

    async getVariables(): Promise<StoredVariable[]> {
        return this.table.toArray();
    }

    async createVariable(variable: StoredVariable): Promise<void> {
        await this.table.add(variable);
    }

    async updateVariable(variable: StoredVariable): Promise<void> {
        await this.table.put(variable);
    }

    async deleteVariableById(id: string): Promise<void> {
        await this.table.delete(id);
    }

}
