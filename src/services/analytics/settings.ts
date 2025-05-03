import type {AnalyticsSettingsCollection} from "@perfice/db/collections";
import type {AnalyticsSettings} from "@perfice/model/analytics/analytics";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";
import type {Form, FormQuestion} from "@perfice/model/form/form";

export class AnalyticsSettingsService {
    private readonly analyticsSettingsCollection: AnalyticsSettingsCollection;

    private observers: EntityObservers<AnalyticsSettings> = new EntityObservers();

    constructor(analyticsSettingsCollection: AnalyticsSettingsCollection) {
        this.analyticsSettingsCollection = analyticsSettingsCollection;
    }

    async getAllSettings(): Promise<AnalyticsSettings[]> {
        return this.analyticsSettingsCollection.getAllSettings();
    }

    async updateSettings(settings: AnalyticsSettings) {
        await this.analyticsSettingsCollection.updateSettings(settings);
        await this.observers.notifyObservers(EntityObserverType.UPDATED, settings);
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

    async createAnalyticsSettingsFromForm(formId: string, questions: FormQuestion[]) {
        let settings: AnalyticsSettings = {
            formId,
            questionId: questions.length > 0 ? questions[0].id : "",
            useMeanValue: Object.fromEntries(questions.map(q => [q.id, true])),
            interpolate: false
        };

        await this.analyticsSettingsCollection.insertSettings(settings);
        await this.observers.notifyObservers(EntityObserverType.CREATED, settings);
    }

    async onFormDeleted(e: Form) {
        await this.analyticsSettingsCollection.deleteSettingsByFormId(e.id);
    }
}
