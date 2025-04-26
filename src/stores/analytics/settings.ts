import {AsyncStore} from "@perfice/stores/store";
import {EntityObserverType} from "@perfice/services/observer";
import type {AnalyticsSettingsService} from "@perfice/services/analytics/settings";
import type {AnalyticsSettings} from "@perfice/model/analytics/analytics";

export class AnalyticsSettingsStore extends AsyncStore<AnalyticsSettings[]> {

    private service: AnalyticsSettingsService;

    constructor(service: AnalyticsSettingsService) {
        super(service.getAllSettings());
        this.service = service;
        this.service.addObserver(EntityObserverType.CREATED,
            async (tag) => this.onAnalyticsSettingsCreated(tag));
        this.service.addObserver(EntityObserverType.UPDATED,
            async (tag) => this.onAnalyticsSettingsUpdated(tag));
    }

    async updateSettings(settings: AnalyticsSettings) {
        await this.service.updateSettings(settings);
    }

    private onAnalyticsSettingsCreated(settings: AnalyticsSettings) {
        this.updateResolved(v => [...v, settings]);
    }

    private onAnalyticsSettingsUpdated(settings: AnalyticsSettings) {
        this.updateResolved(v =>
            v.map(prev => prev.formId == settings.formId ? settings : prev));
    }
}
