import {
    type Integration,
    type IntegrationType,
    type IntegrationUpdate,
    isLocalIntegrationType,
    LOCAL_INTEGRATION_TYPES
} from "@perfice/model/integration/integration";
import {importPrimitive} from "../export/formEntries/export";
import type {FormService} from "../form/form";
import type {JournalService} from "../journal/journal";
import {convertAnswersToDisplay} from "@perfice/model/form/validation";
import {type KyInstance} from "ky";
import {type RemoteService, RemoteType} from "@perfice/services/remote/remote";
import type {AuthService} from "@perfice/services/auth/auth";
import type {AuthenticatedUser} from "@perfice/model/auth/auth";
import type {UnauthenticatedIntegrationError} from "@perfice/model/integration/ui";
import {publishToEventStore} from "@perfice/util/event";
import {unauthenticatedIntegrationEvents} from "@perfice/stores/remote/integration";
import {Capacitor} from "@capacitor/core";
import {Browser} from "@capacitor/browser";
import type {Form} from "@perfice/model/form/form";
import type {LocalIntegrationService} from "@perfice/services/integration/local";

export interface CreateIntegrationRequest {
    integrationType: string;
    entityType: string;
    formId: string;
    fields: Record<string, string>;
    options: Record<string, string | number>;
}

const DISABLE_REMOTE_INTEGRATIONS_STORAGE_KEY = "disable_remote_integrations";

export class IntegrationService {

    private journalService: JournalService;
    private formService: FormService;

    private integrations: Integration[] = [];

    private authService: AuthService;
    private remoteService: RemoteService;
    private localIntegrationService: LocalIntegrationService;

    constructor(journalService: JournalService, formService: FormService, remoteService: RemoteService,
                authService: AuthService, localIntegrationService: LocalIntegrationService) {

        this.journalService = journalService;
        this.formService = formService;
        this.remoteService = remoteService;
        this.authService = authService;
        this.localIntegrationService = localIntegrationService;

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

    private async checkUnauthenticatedIntegrations(integrations: Integration[], integrationTypes: IntegrationType[]): Promise<UnauthenticatedIntegrationError[]> {
        let unauthenticatedErrors: UnauthenticatedIntegrationError[] = [];
        for (let integration of integrations) {
            let type = integrationTypes.find(t => t.integrationType == integration.integrationType);
            if (type == null) continue;

            if (type.authenticated)
                continue;

            let form = await this.formService.getFormById(integration.formId);
            if (form == null) continue;

            let existing = unauthenticatedErrors.find(e => e.integrationType == integration.integrationType);
            if (existing == null) {
                unauthenticatedErrors.push({
                    integrationType: integration.integrationType,
                    integrationTypeName: type.name,
                    forms: [form.name]
                });
            } else {
                existing.forms.push(form.name);
            }
        }

        return unauthenticatedErrors;
    }

    async load(): Promise<IntegrationData> {
        if (!(this.remoteService.isRemoteEnabled(RemoteType.INTEGRATION)))
            return {
                enabled: false,
                integrations: [],
                integrationTypes: []
            };

        let remoteIntegrations: Integration[] = [];
        let remoteIntegrationTypes: IntegrationType[] = [];
        if (!this.areRemoteIntegrationsDisabled()) {
            remoteIntegrations = await this.fetchRemoteIntegrations();
            remoteIntegrationTypes = await this.fetchRemoteIntegrationTypes();

            let errors = await this.checkUnauthenticatedIntegrations(remoteIntegrations, remoteIntegrationTypes);
            if (errors.length > 0) {
                publishToEventStore(unauthenticatedIntegrationEvents, errors);
            }
        }

        let localIntegrations = await this.localIntegrationService.getIntegrations();

        // Sync integrations when loading since we might have received integrations from other devices
        await this.localIntegrationService.syncIntegrations();

        let integrations = [...remoteIntegrations, ...localIntegrations];
        let integrationTypes = [...remoteIntegrationTypes, ...LOCAL_INTEGRATION_TYPES];

        this.integrations = integrations;

        await this.fetchUpdates();
        return {
            enabled: true,
            integrations,
            integrationTypes
        }
    }

    private setRemoteIntegrationsDisabled(disabled: boolean) {
        if (disabled) {
            localStorage.setItem(DISABLE_REMOTE_INTEGRATIONS_STORAGE_KEY, "true");
        } else {
            localStorage.removeItem(DISABLE_REMOTE_INTEGRATIONS_STORAGE_KEY);
        }
    }

    private areRemoteIntegrationsDisabled(): boolean {
        return localStorage.getItem(DISABLE_REMOTE_INTEGRATIONS_STORAGE_KEY) != null;
    }

    async createIntegration(request: CreateIntegrationRequest): Promise<Integration> {
        let created: Integration;
        if (isLocalIntegrationType(request.integrationType)) {
            created = await this.createLocalIntegration(request);
        } else {
            created = await this.createRemoteIntegration(request);
        }

        return created;
    }

    private async createLocalIntegration(request: CreateIntegrationRequest): Promise<Integration> {
        return await this.localIntegrationService.createIntegration(request);
    }

    private async createRemoteIntegration(request: CreateIntegrationRequest): Promise<Integration> {
        let response = await this.getClient().post("integrations", {
            json: request
        });

        return await response.json();
    }

    formatIntegrationIdentifier(integrationId: string, identifier: string): string {
        return `${integrationId}:${identifier}`;
    }

    private async fetchRemoteIntegrations(): Promise<Integration[]> {
        return await this.getClient().get("integrations").json<Integration[]>();
    }

    async authenticateIntegration(integrationType: string) {
        let url = await this.getClient().get(`integrationTypes/${integrationType}/redirect`).text();
        if (Capacitor.isNativePlatform()) {
            await Browser.open({url: url});
        } else {
            window.open(url, "_blank");
        }
    }

    async fetchRemoteIntegrationTypes(): Promise<IntegrationType[]> {
        return await this.getClient().get("integrationTypes").json<IntegrationType[]>();
    }

    async fetchAuthenticationStatus(integrationType: string): Promise<boolean> {
        let res = (await this.getClient().get(`integrationTypes/${integrationType}/authenticated`, {
            throwHttpErrors: false
        }));
        return res.ok;
    }

    private async fetchRemoteUpdates() {
        return await this.getClient().get("updates").json<IntegrationUpdate[]>();
    }

    private async fetchLocalUpdates() {
        return [];
    }

    async fetchUpdates() {
        if (!this.remoteService.isRemoteEnabled(RemoteType.INTEGRATION)) return;

        let remoteUpdates: IntegrationUpdate[] = [];
        if (!this.areRemoteIntegrationsDisabled()) {
            remoteUpdates = await this.fetchRemoteUpdates();
        }

        let localUpdates = await this.fetchLocalUpdates();

        let updates = [...remoteUpdates, ...localUpdates];
        let acknowledgedUpdates: string[] = [];
        for (let update of updates) {
            let integration = this.integrations.find(i => i.id == update.integrationId);
            if (integration == null) continue;

            // Only remote updates need to be acknowledged
            let remote = !isLocalIntegrationType(integration.integrationType);

            let formattedIdentifier = this.formatIntegrationIdentifier(integration.id, update.identifier);
            let existingEntry = await this.journalService.getEntryByIntegrationIdentifier(formattedIdentifier);

            if (update.data == null) {
                if (existingEntry != null) {
                    await this.journalService.deleteEntry(existingEntry);
                }

                if (remote) {
                    acknowledgedUpdates.push(update.id);
                }

                continue;
            }

            let answers = Object.fromEntries(
                Object.entries(update.data).map(([k, v]) => [k, importPrimitive(v)]));

            if (existingEntry == null) {
                let form = await this.formService.getFormById(integration.formId);
                if (form == null) continue;

                // Create a new journal entry
                let formattedAnswers = convertAnswersToDisplay(answers, form.questions);
                await this.journalService.logEntry(form, formattedAnswers, form.format, update.timestamp,
                    formattedIdentifier);

                if (remote) {
                    acknowledgedUpdates.push(update.id);
                }
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

                if (remote) {
                    acknowledgedUpdates.push(update.id);
                }
            }
        }

        if (acknowledgedUpdates.length == 0 || this.areRemoteIntegrationsDisabled()) return;
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

    async updateIntegration(id: string, fields: Record<string, string>, options: Record<string, string | number>) {
        if (this.isIntegrationLocal(id)) {
            await this.updateLocalIntegration(id, fields, options);
        } else {
            await this.updateRemoteIntegration(id, fields, options);
        }
    }

    private async updateRemoteIntegration(id: string, fields: Record<string, string>, options: Record<string, string | number>) {
        await this.getClient().put(`integrations/${id}`, {
            json: {
                fields,
                options,
            }
        });
    }

    private async updateLocalIntegration(id: string, fields: Record<string, string>, options: Record<string, string | number>) {
        await this.localIntegrationService.updateIntegration(id, fields, options);
    }

    async deleteIntegrationById(id: string) {
        if (this.isIntegrationLocal(id)) {
            await this.deleteLocalIntegrationById(id);
        } else {
            await this.deleteRemoteIntegrationById(id);
        }
    }

    private isIntegrationLocal(id: string): boolean {
        let existing = this.integrations.find(i => i.id == id);
        if (existing == null) return false;

        return isLocalIntegrationType(existing.integrationType);
    }

    private async deleteLocalIntegrationById(id: string) {
        await this.localIntegrationService.deleteIntegrationById(id);
    }

    private async deleteRemoteIntegrationById(id: string) {
        await this.getClient().delete(`integrations/${id}`);
    }

    async onFormDeleted(e: Form) {
        if (!(this.remoteService.isRemoteEnabled(RemoteType.INTEGRATION))) return;

        // Delete all integrations that use this form
        for (const integration of this.integrations.filter(i => i.formId == e.id)) {
            await this.deleteIntegrationById(integration.id);
        }

        await this.localIntegrationService.onFormDeleted(e);
    }
}

export interface IntegrationData {
    enabled: boolean;
    integrations: Integration[];
    integrationTypes: IntegrationType[];
}