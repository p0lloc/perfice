import type {AnalyticsSettingsCollection} from "@perfice/db/collections";
import type {AnalyticsSettings} from "@perfice/model/analytics/analytics";

import type {SyncedTable} from "@perfice/services/sync/sync";

export class DexieAnalyticsSettingsCollection implements AnalyticsSettingsCollection {

    private table: SyncedTable<AnalyticsSettings>;

    constructor(table: SyncedTable<AnalyticsSettings>) {
        this.table = table;
    }

    async insertSettings(settings: AnalyticsSettings): Promise<void> {
        await this.table.create(settings);
    }

    async updateSettings(settings: AnalyticsSettings): Promise<void> {
        await this.table.put(settings);
    }

    async getAllSettings(): Promise<AnalyticsSettings[]> {
        return this.table.getAll();
    }

    async getSettingsByFormId(formId: string): Promise<AnalyticsSettings | undefined> {
        return this.table.getById(formId);
    }

    async deleteSettingsByFormId(formId: string): Promise<void> {
        await this.table.deleteById(formId);
    }

}