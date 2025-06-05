import type {Integration, IntegrationType} from "@perfice/model/integration/integration";
import type {IntegrationService} from "@perfice/services/integration/integration";
import {AsyncStore} from "@perfice/stores/store";
import {emptyPromise, resolvedPromise} from "@perfice/util/promise";

export interface IntegrationData {
    integrations: Integration[];
    integrationTypes: IntegrationType[];
}

export class IntegrationStore extends AsyncStore<IntegrationData> {

    private readonly integrationService: IntegrationService;
    private loaded = false;

    constructor(integrationService: IntegrationService) {
        super(emptyPromise());
        this.integrationService = integrationService;
    }

    async load(): Promise<IntegrationData> {
        if (this.loaded) return this.get();

        let integrations = await this.integrationService.fetchIntegrations();
        let types = await this.integrationService.fetchTypes();

        let value = {
            integrations: integrations,
            integrationTypes: types
        }

        await this.integrationService.fetchUpdates();

        this.set(resolvedPromise(value));
        this.loaded = true;
        return value;
    }

    getIntegrationTypes(): Promise<IntegrationType[]> {
        return this.integrationService.fetchTypes();
    }

    authenticateIntegration(integrationType: string) {
        this.integrationService.authenticateIntegration(integrationType);
    }

    fetchAuthenticationStatus(integrationType: string): Promise<boolean> {
        return this.integrationService.fetchAuthenticationStatus(integrationType);
    }

    async createIntegration(integrationType: string, entityType: string, formId: string, fields: Record<string, string>) {
        let created = await this.integrationService.createIntegration({
            integrationType: integrationType,
            entityType: entityType,
            formId: formId,
            fields: fields
        });

        this.updateResolved(v => ({
            ...v,
            integrations: [...v.integrations, created]
        }));
    }

    async fetchHistorical(id: string) {
        await this.integrationService.fetchHistorical(id);
    }

    async updateIntegration(id: string, fields: Record<string, string>) {
        await this.integrationService.updateIntegration(id, fields);
        this.updateResolved(v => ({
            ...v,
            integrations: v.integrations.map(i => i.id == id ? {
                ...i,
                fields: fields
            } : i)
        }));
    }

    async deleteIntegrationById(id: string) {
        await this.integrationService.deleteIntegrationById(id);
        this.updateResolved(v => ({
            ...v,
            integrations: v.integrations.filter(i => i.id != id)
        }));
    }
}
