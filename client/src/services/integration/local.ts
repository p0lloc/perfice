import type {LocalIntegrationCollection} from "@perfice/db/collections";
import type {Integration, IntegrationUpdate} from "@perfice/model/integration/integration";
import type {CreateIntegrationRequest} from "@perfice/services/integration/integration";
import type {Form} from "@perfice/model/form/form";
import {Perfice} from "perfice-android";
import {Capacitor} from "@capacitor/core";

export class LocalIntegrationService {

    private localIntegrationCollection: LocalIntegrationCollection;

    constructor(localIntegrationCollection: LocalIntegrationCollection) {
        this.localIntegrationCollection = localIntegrationCollection;
    }

    getIntegrations(): Promise<Integration[]> {
        return this.localIntegrationCollection.getIntegrations();
    }

    async createIntegration(request: CreateIntegrationRequest) {
        let integration: Integration = {
            id: crypto.randomUUID(),
            integrationType: request.integrationType,
            formId: request.formId,
            fields: request.fields,
            options: request.options,
            webhook: null,
            entityType: request.entityType,
        };

        await this.localIntegrationCollection.createIntegration(integration);
        await this.syncIntegrations();
        return integration;
    }

    async checkOrPromptPermissions(): Promise<boolean> {
        if (!Capacitor.isNativePlatform()) return false;

        try {
            let result = await Perfice.promptPermissions();
            return result.result;
        } catch (e) {
            return false;
        }
    }

    async syncIntegrations() {
        if (!Capacitor.isNativePlatform()) return;

        let storedIntegrations = await this.localIntegrationCollection.getIntegrations();

        await Perfice.syncIntegrations({
            integrations: storedIntegrations.map(i => ({
                id: i.id,
                integrationType: i.integrationType,
                entityType: i.entityType,
                formId: i.formId,
                fields: i.fields,
                options: i.options,
            }))
        });
    }

    async onFormDeleted(e: Form) {
        await this.localIntegrationCollection.deleteIntegrationsByFormId(e.id);
        await this.syncIntegrations();
    }

    async getUpdates(): Promise<IntegrationUpdate[]> {
        if (!Capacitor.isNativePlatform()) return [];

        let native = await Perfice.getUpdates();
        return native.updates.map(u => ({
            id: u.id,
            integrationId: u.integrationId,
            identifier: u.identifier,
            data: u.data,
            timestamp: u.timestamp
        }));
    }

    async fetchHistorical(id: string) {
        await Perfice.fetchHistorical({id});
    }

    async updateIntegration(id: string, fields: Record<string, string>, options: Record<string, string | number>) {
        let existing = await this.localIntegrationCollection.getIntegrationById(id);
        if (existing == null) return;

        await this.localIntegrationCollection.updateIntegration({
            ...existing,
            fields: fields,
            options: options,
        });
        await this.syncIntegrations();
    }

    async deleteIntegrationById(id: string) {
        await this.localIntegrationCollection.deleteIntegrationById(id);
        await this.syncIntegrations();
    }

}