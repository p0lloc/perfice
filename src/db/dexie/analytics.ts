import type {AnalyticsSettingsCollection} from "@perfice/db/collections";
import type {EntityTable} from "dexie";
import type {AnalyticsSettings} from "@perfice/model/analytics/analytics";

export class DexieAnalyticsSettingsCollection implements AnalyticsSettingsCollection {

    private table: EntityTable<AnalyticsSettings, "formId">;

    constructor(table: EntityTable<AnalyticsSettings, "formId">) {
        this.table = table;
    }

    async insertSettings(settings: AnalyticsSettings): Promise<void> {
        await this.table.add(settings);
    }

    async updateSettings(settings: AnalyticsSettings): Promise<void> {
        await this.table.put(settings);
    }

    async getAllSettings(): Promise<AnalyticsSettings[]> {
        return this.table.toArray();
    }

    async getSettingsByFormId(formId: string): Promise<AnalyticsSettings | undefined> {
        return this.table.get(formId);
    }

    async deleteSettingsByFormId(formId: string): Promise<void> {
        await this.table.delete(formId);
    }

}