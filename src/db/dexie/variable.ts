import type {VariableCollection} from "@perfice/db/collections";
import type {StoredVariable} from "@perfice/model/variable/variable";
import type {SyncedTable} from "@perfice/services/sync/sync";

export class DexieVariableCollection implements VariableCollection {

    private table: SyncedTable<StoredVariable>;

    constructor(table: SyncedTable<StoredVariable>) {
        this.table = table;
    }

    getVariableById(id: string): Promise<StoredVariable | undefined> {
        return this.table.getById(id);
    }

    async getVariables(): Promise<StoredVariable[]> {
        return this.table.getAll();
    }

    async createVariable(variable: StoredVariable): Promise<void> {
        await this.table.put(variable);
    }

    async updateVariable(variable: StoredVariable): Promise<void> {
        await this.table.put(variable);
    }

    async deleteVariableById(id: string): Promise<void> {
        await this.table.deleteById(id);
    }

}
