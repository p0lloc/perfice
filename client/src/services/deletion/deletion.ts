import type {Table} from "dexie";

export class DeletionService {

    private readonly tables: Record<string, Table>;

    constructor(tables: Record<string, Table>) {
        this.tables = tables;
    }

    async deleteAllData() {
        localStorage.clear();
        for (let table of Object.values(this.tables)) {
            await table.clear();
        }
    }

}