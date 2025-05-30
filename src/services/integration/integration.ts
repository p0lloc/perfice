import type {Integration, IntegrationType, IntegrationUpdate} from "@perfice/model/integration/integration";
import {importPrimitive} from "../export/formEntries/export";
import type {FormService} from "../form/form";
import type {JournalService} from "../journal/journal";
import {convertAnswersToDisplay} from "@perfice/model/form/validation";

export interface CreateIntegrationRequest {
    integrationType: string;
    entityType: string;
    formId: string;
    fields: Record<string, string>;
}

const USES_INTEGRATIONS_STORAGE_KEY = "uses_integrations";

export class IntegrationService {

    private serviceUrl: string;
    private journalService: JournalService;
    private formService: FormService;

    private integrations: Integration[] = [];

    constructor(serviceUrl: string, journalService: JournalService, formService: FormService) {
        this.serviceUrl = serviceUrl;
        this.journalService = journalService;
        this.formService = formService;
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
        let response = await fetch(`${this.serviceUrl}/integrations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer 123"
            },
            body: JSON.stringify(request)
        });

        localStorage.setItem(USES_INTEGRATIONS_STORAGE_KEY, "true");
        let created: Integration = await response.json();
        this.integrations.push(created);
        return created;
    }

    formatIntegrationIdentifier(integrationType: string, identifier: string): string {
        return `${integrationType}:${identifier}`;
    }

    async fetchIntegrations(): Promise<Integration[]> {
        let response = await fetch(`${this.serviceUrl}/integrations`, {
            headers: {
                "Authorization": "Bearer 123"
            }
        });

        let integrations: Integration[] = await response.json();
        this.integrations = integrations;
        return integrations;
    }

    async authenticateIntegration(integrationType: string) {
        let response = await fetch(`${this.serviceUrl}/${integrationType}/redirect`, {
            headers: {
                "Authorization": "Bearer 123"
            }
        });

        let url = await response.text();
        window.open(url, "_blank");
    }

    async fetchTypes(): Promise<IntegrationType[]> {
        let response = await fetch(`${this.serviceUrl}/integrationTypes`, {
            headers: {
                "Authorization": "Bearer 123"
            }
        });
        return await response.json();
    }

    async fetchAuthenticationStatus(integrationType: string): Promise<boolean> {
        let response = await fetch(`${this.serviceUrl}/integrationTypes/${integrationType}/authenticated`, {
            headers: {
                "Authorization": "Bearer 123"
            }
        });
        return response.status == 200;
    }

    async fetchUpdates() {
        let response = await fetch(`${this.serviceUrl}/updates`, {
            headers: {
                "Authorization": "Bearer 123"
            }
        });
        let updates: IntegrationUpdate[] = await response.json();

        let acknowledgedUpdates: string[] = [];
        for (let update of updates) {
            let integration = this.integrations.find(i => i.id == update.integrationId);
            if (integration == null) continue;

            let formattedIdentifier = this.formatIntegrationIdentifier(integration.integrationType, update.identifier);
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
        await fetch(`${this.serviceUrl}/updates/ack`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer 123"
            },
            body: JSON.stringify({
                updates: updates
            })
        });
    }

    async updateIntegration(id: string, fields: Record<string, string>) {
        await fetch(`${this.serviceUrl}/integrations/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer 123"
            },
            body: JSON.stringify({
                fields: fields
            })
        });
    }

    async deleteIntegrationById(id: string) {
        await fetch(`${this.serviceUrl}/integrations/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer 123"
            }
        });
    }
}
