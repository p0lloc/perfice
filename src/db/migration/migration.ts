import {ChartTitlesMigration} from "@perfice/db/migration/migrations/chartTitles";

export const CURRENT_DATA_VERSION: number = 1;
export const CURRENT_VERSION_STORAGE_KEY = "data_version";

const MIGRATIONS: Migration[] = [new ChartTitlesMigration()];

export interface Migration {
    apply(entity: any): Promise<object>;

    getEntityType(): string;

    getVersion(): number;
}

export interface Migrator {
    applyMigration(migration: Migration): Promise<void>;
}

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
        } else {
            // Version is missing, set it to the current version
            localStorage.setItem(CURRENT_VERSION_STORAGE_KEY, CURRENT_DATA_VERSION.toString());
        }

        return CURRENT_DATA_VERSION;
    }

    async migrate() {
        let userVersion = this.getUserVersion();
        if (userVersion >= CURRENT_DATA_VERSION) return;

        console.log("Migrating from version", userVersion, "to", CURRENT_DATA_VERSION);

        let relevantMigrations = MIGRATIONS
            .filter(m => m.getVersion() > userVersion
                && m.getVersion() <= CURRENT_DATA_VERSION);

        for (let migration of relevantMigrations) {
            await this.migrator.applyMigration(migration);
        }

        localStorage.setItem(CURRENT_VERSION_STORAGE_KEY, CURRENT_DATA_VERSION.toString());
        console.log("Migration complete");
    }

}