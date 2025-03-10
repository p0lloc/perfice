import type { AnalyticsSettingsCollection } from "@perfice/db/collections";
import type { AnalyticsSettings } from "@perfice/model/analytics/analytics";
import { type EntityObserverCallback, EntityObservers, EntityObserverType } from "@perfice/services/observer";

export class AnalyticsSettingsService {
    private readonly analyticsSettingsCollection: AnalyticsSettingsCollection;

    private observers: EntityObservers<AnalyticsSettings> = new EntityObservers();

    constructor(analyticsSettingsCollection: AnalyticsSettingsCollection) {
        this.analyticsSettingsCollection = analyticsSettingsCollection;
    }

    async getAllSettings(): Promise<AnalyticsSettings[]> {
        return this.analyticsSettingsCollection.getAllSettings();
    }

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<AnalyticsSettings>) {
        this.observers.addObserver(type, callback);
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<AnalyticsSettings>) {
        this.observers.removeObserver(type, callback);
    }

    async getSettingsByForm(formId: string): Promise<AnalyticsSettings | undefined> {
        return this.analyticsSettingsCollection.getSettingsByFormId(formId);
    }

}
