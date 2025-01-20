import type {IndexCollection, IndexUpdateListener} from "@perfice/db/collections";
import type {EntityTable} from "dexie";
import type {VariableIndex} from "@perfice/model/variable/variable";

export class DexieIndexCollection implements IndexCollection {

    private table: EntityTable<VariableIndex, "id">;
    private updateListeners: IndexUpdateListener[] = [];

    constructor(table: EntityTable<VariableIndex, "id">) {
        this.table = table;
    }

    async getIndexByVariableAndTimeScope(variableId: string, timeScope: string): Promise<VariableIndex | undefined> {
        return this.table.where("[variableId+timeScope]").equals([variableId, timeScope]).first();
    }

    async createIndex(index: VariableIndex): Promise<void> {
        await this.table.add(index);
    }

    async updateIndex(index: VariableIndex): Promise<void> {
        await this.table.put(index);

        for (const callback of this.updateListeners) {
            await callback(index);
        }
    }

    async updateIndices(indices: VariableIndex[]): Promise<void> {
        await this.table.bulkPut(indices);
    }

    async deleteIndicesByIds(ids: string[]): Promise<void> {
        await this.table.bulkDelete(ids);
    }

    async getIndicesByVariableId(variableId: string): Promise<VariableIndex[]> {
        return this.table.where("variableId").equals(variableId).toArray();
    }

    async deleteIndicesByVariableId(id: string): Promise<void> {
        await this.table.where("variableId").equals(id).delete();
    }

    addUpdateListener(listener: IndexUpdateListener) {
        this.updateListeners.push(listener);
    }

    removeUpdateListener(listener: IndexUpdateListener) {
        this.updateListeners = this.updateListeners.filter(l => l != listener);
    }
}
