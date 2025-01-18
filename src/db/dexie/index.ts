import type {IndexCollection} from "@perfice/db/collections";
import type {EntityTable} from "dexie";
import type {VariableIndex} from "@perfice/model/variable/variable";

export class DexieIndexCollection implements IndexCollection {

    private table: EntityTable<VariableIndex, "id">;


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
    }

    async getIndicesByVariableId(variableId: string): Promise<VariableIndex[]> {
        return this.table.where("variableId").equals(variableId).toArray();
    }

    async deleteIndicesByVariableId(id: string): Promise<void> {
        await this.table.where("variableId").equals(id).delete();
    }

}