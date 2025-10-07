import type {IntegrationData, IntegrationService} from "@perfice/services/integration/integration";
import {AsyncStore} from "@perfice/stores/store";
import {emptyPromise, resolvedPromise} from "@perfice/util/promise";
import {writable} from "svelte/store";
import type {UnauthenticatedIntegrationError} from "@perfice/model/integration/ui";
import {isLocalIntegrationType} from "@perfice/model/integration/integration";

export const unauthenticatedIntegrationEvents = writable<UnauthenticatedIntegrationError[][]>([]);

export class IntegrationStore extends AsyncStore<IntegrationData> {

    private readonly integrationService: IntegrationService;
    private loaded = false;

    constructor(integrationService: IntegrationService) {
        super(emptyPromise());
        this.integrationService = integrationService;
    }

    async load(): Promise<IntegrationData> {
        if (this.loaded) return this.get();

        let value = await this.integrationService.load();

        this.set(resolvedPromise(value));
        this.loaded = true;
        return value;
    }

    authenticateIntegration(integrationType: string) {
        this.integrationService.authenticateIntegration(integrationType);
    }

    async fetchAuthenticationStatus(integrationType: string): Promise<boolean> {
        if (isLocalIntegrationType(integrationType)) {
            return true;
        }

        return this.integrationService.fetchAuthenticationStatus(integrationType);
    }

    async createIntegration(integrationType: string, entityType: string, formId: string, fields: Record<string, string>, options: Record<string, string | number>) {
        let created = await this.integrationService.createIntegration({
            integrationType: integrationType,
            entityType: entityType,
            formId: formId,
            fields: fields,
            options,
        });

        this.updateResolved(v => ({
            ...v,
            integrations: [...v.integrations, created]
        }));
    }

    async fetchHistorical(id: string) {
        await this.integrationService.fetchHistorical(id);
    }

    async updateIntegration(id: string, fields: Record<string, string>, options: Record<string, string | number>) {
        await this.integrationService.updateIntegration(id, fields, options);
        this.updateResolved(v => ({
            ...v,
            integrations: v.integrations.map(i => i.id == id ? {
                ...i,
                fields: fields,
                options,
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

    async refresh() {
        await this.integrationService.fetchUpdates();
    }
}
