import type {Integration, IntegrationType, IntegrationUpdate} from "@perfice/model/integration/integration";
import {importPrimitive} from "../export/formEntries/export";
import type {FormService} from "../form/form";
import type {JournalService} from "../journal/journal";
import {convertAnswersToDisplay} from "@perfice/model/form/validation";
import ky, {type KyInstance} from "ky";

export interface CreateIntegrationRequest {
    integrationType: string;
    entityType: string;
    formId: string;
    fields: Record<string, string>;
}

const USES_INTEGRATIONS_STORAGE_KEY = "uses_integrations";

export class IntegrationService {

    private journalService: JournalService;
    private formService: FormService;

    private integrations: Integration[] = [];
    private client: KyInstance;

    constructor(journalService: JournalService, formService: FormService) {
        this.journalService = journalService;
        this.formService = formService;

        this.client = ky.extend({
            prefixUrl: `${import.meta.env.VITE_BACKEND_URL}/`,
            retry: 0,
            credentials: "include"
        })
    }

    // TODO: support local integrations

    private usesIntegrations() {
        return localStorage.getItem(USES_INTEGRATIONS_STORAGE_KEY) != null;
    }

    async load() {
        if (!this.usesIntegrations()) return;

        this.integrations = await this.fetchIntegrations();
    }

    async createIntegration(request: CreateIntegrationRequest) {
        let response = await this.client.post("integrations", {
            json: request
        });

        localStorage.setItem(USES_INTEGRATIONS_STORAGE_KEY, "true");
        let created: Integration = await response.json();
        this.integrations.push(created);
        return created;
    }

    formatIntegrationIdentifier(integrationId: string, identifier: string): string {
        return `${integrationId}:${identifier}`;
    }

    async fetchIntegrations(): Promise<Integration[]> {
        let integrations = await this.client.get("integrations").json<Integration[]>();
        this.integrations = integrations;
        return integrations;
    }

    async authenticateIntegration(integrationType: string) {
        let url = await this.client.get(`integrationTypes/${integrationType}/redirect`).text();
        window.open(url, "_blank");
    }

    async fetchTypes(): Promise<IntegrationType[]> {
        return await this.client.get("integrationTypes").json<IntegrationType[]>();
    }

    async fetchAuthenticationStatus(integrationType: string): Promise<boolean> {
        return (await this.client.get(`integrationTypes/${integrationType}/authenticated`, {
            throwHttpErrors: false
        })).ok;
    }

    async fetchUpdates() {
        let updates = await this.client.get("updates").json<IntegrationUpdate[]>();

        let acknowledgedUpdates: string[] = [];
        for (let update of updates) {
            let integration = this.integrations.find(i => i.id == update.integrationId);
            if (integration == null) continue;

            let formattedIdentifier = this.formatIntegrationIdentifier(integration.id, update.identifier);
            let existingEntry = await this.journalService.getEntryByIntegrationIdentifier(formattedIdentifier);

            let answers = Object.fromEntries(
                Object.entries(update.data).map(([k, v]) => [k, importPrimitive(v)]));

            if (existingEntry == null) {
                let form = await this.formService.getFormById(integration.formId);
                if (form == null) continue;

                // Create a new journal entry
                let formattedAnswers = convertAnswersToDisplay(answers, form.questions);
                await this.journalService.logEntry(form, formattedAnswers, form.format, update.timestamp,
                    formattedIdentifier);

                acknowledgedUpdates.push(update.id);
            } else {
                let snapshot = await this.formService.getFormSnapshotById(existingEntry.snapshotId);
                if (snapshot == null) continue;

                // Update the existing journal entry
                let formattedAnswers = convertAnswersToDisplay(answers, snapshot.questions);
                await this.journalService.updateEntry({
                    ...existingEntry,
                    answers: formattedAnswers,
                    timestamp: update.timestamp
                }, snapshot.format);

                acknowledgedUpdates.push(update.id);
            }
        }

        if (acknowledgedUpdates.length == 0) return;
        await this.acknowledgeUpdates(acknowledgedUpdates);
    }

    private async acknowledgeUpdates(updates: string[]) {
        await this.client.post("updates/ack", {
            json: {
                updates: updates
            }
        });
    }

    async fetchHistorical(id: string) {
        await this.client.post(`integrations/${id}/historical`);
        await this.fetchUpdates();
    }

    async updateIntegration(id: string, fields: Record<string, string>) {
        await this.client.put(`integrations/${id}`, {
            json: {
                fields: fields
            }
        });
    }

    async deleteIntegrationById(id: string) {
        await this.client.delete(`integrations/${id}`);
    }
}
