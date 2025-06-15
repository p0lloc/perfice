import type {Integration, IntegrationType, IntegrationUpdate} from "@perfice/model/integration/integration";
import {importPrimitive} from "../export/formEntries/export";
import type {FormService} from "../form/form";
import type {JournalService} from "../journal/journal";
import {convertAnswersToDisplay} from "@perfice/model/form/validation";
import {type KyInstance} from "ky";
import {type RemoteService, RemoteType} from "@perfice/services/remote/remote";
import type {AuthService} from "@perfice/services/auth/auth";
import type {AuthenticatedUser} from "@perfice/model/auth/auth";

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

    private authService: AuthService;
    private remoteService: RemoteService;

    constructor(journalService: JournalService, formService: FormService, remoteService: RemoteService, authService: AuthService) {
        this.journalService = journalService;
        this.formService = formService;
        this.remoteService = remoteService;
        this.authService = authService;

        this.remoteService.addRemoteEnableCallback(RemoteType.INTEGRATION, async () => {
            await this.load();
        });

        this.authService.addAuthStatusCallback(async (user: AuthenticatedUser | null) => {
            if (user == null) return;
            await this.load();
        });
    }

    private getClient(): KyInstance {
        return this.remoteService.getRemoteClient(RemoteType.INTEGRATION)!;
    }

    async load() {
        if (!(this.remoteService.isRemoteEnabled(RemoteType.INTEGRATION)))
            return;

        let integrations = await this.fetchIntegrations();
        let integrationTypes = await this.fetchTypes();

        await this.fetchUpdates();
        return {
            integrations,
            integrationTypes
        }
    }

    async createIntegration(request: CreateIntegrationRequest) {
        let response = await this.getClient().post("integrations", {
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
        this.integrations = await this.getClient().get("integrations").json<Integration[]>();
        return this.integrations;
    }

    async authenticateIntegration(integrationType: string) {
        let url = await this.getClient().get(`integrationTypes/${integrationType}/redirect`).text();
        window.open(url, "_blank");
    }

    async fetchTypes(): Promise<IntegrationType[]> {
        return await this.getClient().get("integrationTypes").json<IntegrationType[]>();
    }

    async fetchAuthenticationStatus(integrationType: string): Promise<boolean> {
        return (await this.getClient().get(`integrationTypes/${integrationType}/authenticated`, {
            throwHttpErrors: false
        })).ok;
    }

    async fetchUpdates() {
        if (!this.remoteService.isRemoteEnabled(RemoteType.INTEGRATION)) return;
        let updates = await this.getClient().get("updates").json<IntegrationUpdate[]>();

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
        await this.getClient().post("updates/ack", {
            json: {
                updates: updates
            }
        });
    }

    async fetchHistorical(id: string) {
        await this.getClient().post(`integrations/${id}/historical`);
        await this.fetchUpdates();
    }

    async updateIntegration(id: string, fields: Record<string, string>) {
        await this.getClient().put(`integrations/${id}`, {
            json: {
                fields: fields
            }
        });
    }

    async deleteIntegrationById(id: string) {
        await this.getClient().delete(`integrations/${id}`);
    }
}
