import {AsyncStore} from "@perfice/stores/store";
import {EntityObserverType} from "@perfice/services/observer";
import type { AnalyticsSettingsService } from "@perfice/services/analytics/settings";
import type {AnalyticsSettings} from "@perfice/model/analytics/analytics";

export class AnalyticsSettingsStore extends AsyncStore<AnalyticsSettings[]> {

    private service: AnalyticsSettingsService;

    constructor(service: AnalyticsSettingsService) {
        super(service.getAllSettings());
        this.service = service;
        this.service.addObserver(EntityObserverType.UPDATED,
            async (tag) => await this.onAnalyticsSettingsUpdated(tag));
    }

    private async onAnalyticsSettingsUpdated(tag: AnalyticsSettings) {
        return undefined;
    }
}
