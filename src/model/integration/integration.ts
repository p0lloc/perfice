export interface Integration {
    id: string;
    formId: string;
    integrationType: string;
    entityType: string;
    fields: Record<string, string>;
}

export interface IntegrationType {
    integrationType: string;
    authenticated: boolean;
    name: string;
    logo: string;
    entities: IntegrationEntityDefinition[];
}

export interface IntegrationEntityDefinition {
    name: string;
    entityType: string;
    fields: Record<string, string>;
}

export interface IntegrationUpdate {
    id: string;
    integrationId: string;
    identifier: string;
    data: Record<string, any>;
    timestamp: number;
}
