import type {DexieDB} from "@perfice/db/dexie/db";
import type {Table} from "dexie";
import type {Migration, Migrator} from "@perfice/db/migration/migration";

export class DexieMigrator implements Migrator {
    private readonly db: DexieDB;

    constructor(db: DexieDB) {
        this.db = db;
    }

    async applyMigration(migration: Migration): Promise<void> {
        // @ts-ignore
        let collection: Table<object> | undefined = this.db[migration.getEntityType()];
        if (collection == undefined) {
            console.error("Missing collection for entity type", migration.getEntityType());
            return;
        }

        let allEntities = await collection.toArray();
        let result: object[] = [];
        for (let entity of allEntities) {
            result.push(await migration.apply(structuredClone(entity)));
        }

        await collection.bulkPut(result);
    }

}