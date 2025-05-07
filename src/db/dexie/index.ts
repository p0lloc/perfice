import type {IndexCollection, IndexUpdateListener} from "@perfice/db/collections";
import type {Collection, EntityTable} from "dexie";
import type {VariableIndex} from "@perfice/model/variable/variable";

export class DexieIndexCollection implements IndexCollection {

    private table: EntityTable<VariableIndex, "id">;
    private updateListeners: IndexUpdateListener[] = [];
    private deleteListeners: IndexUpdateListener[] = [];

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

    async getIndicesByVariableId(variableId: string): Promise<VariableIndex[]> {
        return this.table.where("variableId").equals(variableId).toArray();
    }

    async deleteIndicesByVariableId(id: string): Promise<void> {
        let query = this.table.where("variableId").equals(id);
        await this.performBulkDeleteQuery(query);
    }

    async deleteIndicesByIds(ids: string[]): Promise<void> {
        let query = this.table.where("id").anyOf(ids);
        await this.performBulkDeleteQuery(query);
    }

    async deleteIndicesByVariableIds(variablesToDelete: string[]): Promise<void> {
        let query = this.table
            .where("variableId")
            .anyOf(variablesToDelete);

        await this.performBulkDeleteQuery(query);
    }

    private async performBulkDeleteQuery(query: Collection): Promise<void> {
        let indices = await query.toArray();
        await query.delete();
        await this.notifyDeletion(indices);
    }

    private async notifyDeletion(indices: VariableIndex[]) {
        for (let index of indices) {
            for (const callback of this.deleteListeners) {
                await callback(index);
            }
        }
    }

    addUpdateListener(listener: IndexUpdateListener) {
        this.updateListeners.push(listener);
    }

    removeUpdateListener(listener: IndexUpdateListener) {
        this.updateListeners = this.updateListeners.filter(l => l != listener);
    }

    addDeleteListener(listener: IndexUpdateListener) {
        this.deleteListeners.push(listener);
    }

    removeDeleteListener(listener: IndexUpdateListener) {
        this.deleteListeners = this.deleteListeners.filter(l => l != listener);
    }

    async deleteAllIndices() {
        await this.table.clear();
    }

}
