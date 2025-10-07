import type {LocalIntegrationCollection} from "@perfice/db/collections";
import type {Integration} from "@perfice/model/integration/integration";
import type {CreateIntegrationRequest} from "@perfice/services/integration/integration";
import type {Form} from "@perfice/model/form/form";

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

    async syncIntegrations() {
        let storedIntegrations = await this.localIntegrationCollection.getIntegrations();

        // TODO: Sync with native code
    }

    async onFormDeleted(e: Form) {
        await this.localIntegrationCollection.deleteIntegrationsByFormId(e.id);
    }

    async updateIntegration(id: string, fields: Record<string, string>, options: Record<string, string | number>) {
        let existing = await this.localIntegrationCollection.getIntegrationById(id);
        if (existing == null) return;

        await this.localIntegrationCollection.updateIntegration({
            ...existing,
            fields: fields,
            options: options,
        });
    }

    async deleteIntegrationById(id: string) {
        await this.localIntegrationCollection.deleteIntegrationById(id);
    }
}