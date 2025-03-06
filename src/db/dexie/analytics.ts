import type {AnalyticsSettingsCollection} from "@perfice/db/collections";
import type {AnalyticsSettings} from "@perfice/services/analytics/analytics";
import type {EntityTable} from "dexie";

export class DexieAnalyticsSettingsCollection implements AnalyticsSettingsCollection {

    private table: EntityTable<AnalyticsSettings, "formId">;

    constructor(table: EntityTable<AnalyticsSettings, "formId">) {
        this.table = table;
    }

    async getAllSettings(): Promise<AnalyticsSettings[]> {
        return this.table.toArray();
    }

    async getSettingsByFormId(formId: string): Promise<AnalyticsSettings | undefined> {
        return this.table.get(formId);
    }

}