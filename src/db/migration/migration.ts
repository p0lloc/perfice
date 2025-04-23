import type {DexieDB} from "@perfice/db/dexie/db";
import type {Table} from "dexie";

export const CURRENT_DATA_VERSION: number = 0;
export const CURRENT_VERSION_STORAGE_KEY = "data_version";

export interface Migration {
    apply(entity: object): Promise<object>;

    getEntityType(): string;

    getVersion(): number;
}

export interface Migrator {
    applyMigration(migration: Migration): Promise<void>;
}

const migrations: Migration[] = [];

export class MigrationService {

    private migrator: Migrator;

    constructor(migrator: Migrator) {
        this.migrator = migrator;
    }

    private getUserVersion(): number {
        let value = localStorage.getItem(CURRENT_VERSION_STORAGE_KEY);
        if (value != null) {
            let number = parseInt(value);
            if (!isNaN(number)) {
                return number;
            }
        }

        return CURRENT_DATA_VERSION;
    }

    async migrate() {
        let userVersion = this.getUserVersion();
        if (userVersion >= CURRENT_DATA_VERSION) return;

        let relevantMigrations = migrations
            .filter(m => m.getVersion() > userVersion
                && m.getVersion() <= CURRENT_DATA_VERSION);

        for (let migration of relevantMigrations) {
            await this.migrator.applyMigration(migration);
        }

        localStorage.setItem(CURRENT_VERSION_STORAGE_KEY, CURRENT_DATA_VERSION.toString());
    }

}

export class DexieMigrator implements Migrator {
    private readonly db: DexieDB;

    constructor(db: DexieDB) {
        this.db = db;
    }

    async applyMigration<T extends object>(migration: Migration): Promise<void> {
        // @ts-ignore
        let collection: Table<T> | undefined = this.db[migration.getEntityType()];
        if (collection == undefined) return;

        let allEntities = await collection.toArray();
        for (let entity of allEntities) {
            await migration.apply(entity);
        }
    }

}