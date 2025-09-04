import type {Reflection} from "@perfice/model/reflection/reflection";
import type {ReflectionCollection} from "@perfice/db/collections";
import type {SyncedTable} from "@perfice/services/sync/sync";

export class DexieReflectionCollection implements ReflectionCollection {

    private table: SyncedTable<Reflection>;

    constructor(table: SyncedTable<Reflection>) {
        this.table = table;
    }

    async getReflections(): Promise<Reflection[]> {
        return this.table.getAll();
    }

    async getReflectionById(id: string): Promise<Reflection | undefined> {
        return this.table.getById(id);
    }

    async createReflection(reflection: Reflection): Promise<void> {
        await this.table.create(reflection);
    }

    async updateReflection(reflection: Reflection): Promise<void> {
        await this.table.put(reflection);
    }

    async deleteReflectionById(id: string): Promise<void> {
        await this.table.deleteById(id);
    }

}