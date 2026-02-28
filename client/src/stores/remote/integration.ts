import type {IntegrationData, IntegrationService} from "@perfice/services/integration/integration";
import {AsyncStore} from "@perfice/stores/store";
import {emptyPromise, resolvedPromise} from "@perfice/util/promise";
import {writable} from "svelte/store";
import type {UnauthenticatedIntegrationError} from "@perfice/model/integration/ui";

export const unauthenticatedIntegrationEvents = writable<UnauthenticatedIntegrationError[][]>([]);

export class IntegrationStore extends AsyncStore<IntegrationData> {

    private readonly integrationService: IntegrationService;
    private loaded = false;

    constructor(integrationService: IntegrationService) {
        super(emptyPromise());
        this.integrationService = integrationService;
        this.integrationService.onEnable(async (data) => {
            this.set(resolvedPromise(data));
            this.loaded = true;
        });

        this.integrationService.onDisable(async () => {
            this.set(emptyPromise());
            this.loaded = false;
        });
    }

    async load(): Promise<IntegrationData> {
        if (this.loaded) return this.get();

        return await this.integrationService.load();
    }

    authenticateIntegration(integrationType: string) {
        this.integrationService.authenticateIntegration(integrationType);
    }

    async fetchAuthenticationStatus(integrationType: string): Promise<boolean> {
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

    async fetchHistorical(id: string, integrationType: string): Promise<{ oldest: number, count: number } | null> {
        return await this.integrationService.fetchHistorical(id, integrationType);
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
