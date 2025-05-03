import {ChartTitlesMigration} from "@perfice/db/migration/migrations/chartTitles";
import {FormQuestionDefaultValuesMigration} from "@perfice/db/migration/migrations/defaultQuestionValues";

export const CURRENT_DATA_VERSION: number = 2;
export const CURRENT_VERSION_STORAGE_KEY = "data_version";

const MIGRATIONS: Migration[] = [new ChartTitlesMigration(), new FormQuestionDefaultValuesMigration()];

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

    getUserVersion(): number {
        let value = localStorage.getItem(CURRENT_VERSION_STORAGE_KEY);
        if (value != null) {
            let number = parseInt(value);
            if (!isNaN(number)) {
                return number;
            }
        } else {
            // Version is missing, set it to the current version
            this.saveUserVersion(CURRENT_DATA_VERSION);
        }

        return CURRENT_DATA_VERSION;
    }

    saveUserVersion(value: number) {
        localStorage.setItem(CURRENT_VERSION_STORAGE_KEY, value.toString());
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

        this.saveUserVersion(CURRENT_DATA_VERSION);
        console.log("Migration complete");
    }

}