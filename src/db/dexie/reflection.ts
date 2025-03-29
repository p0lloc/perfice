import type {Reflection} from "@perfice/model/reflection/reflection";
import type {EntityTable} from "dexie";
import type {ReflectionCollection} from "@perfice/db/collections";

export class DexieReflectionCollection implements ReflectionCollection {

    private table: EntityTable<Reflection, "id">;

    constructor(table: EntityTable<Reflection, "id">) {
        this.table = table;
    }

    async getReflections(): Promise<Reflection[]> {
        return this.table.toArray();
    }

    async getReflectionById(id: string): Promise<Reflection | undefined> {
        return this.table.get(id);
    }

    async createReflection(reflection: Reflection): Promise<void> {
        await this.table.add(reflection);
    }

    async updateReflection(reflection: Reflection): Promise<void> {
        await this.table.put(reflection);
    }

    async deleteReflectionById(id: string): Promise<void> {
        await this.table.delete(id);
    }

}