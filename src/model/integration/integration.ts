export interface Integration {
    id: string;
    formId: string;
    integrationType: string;
    entityType: string;
    fields: Record<string, string>;
    options: Record<string, string | number>;
}

export interface IntegrationType {
    integrationType: string;
    authenticated: boolean;
    name: string;
    logo: string;
    entities: IntegrationEntityDefinition[];
}

export enum IntegrationOptionType {
    TEXT = "text",
    NUMBER = "number",
}

export interface IntegrationOption {
    type: IntegrationOptionType;
    name: string;
    description: string;
}

export interface IntegrationEntityDefinition {
    name: string;
    entityType: string;
    fields: Record<string, string>;
    options: Record<string, IntegrationOption>;
}

export interface IntegrationUpdate {
    id: string;
    integrationId: string;
    identifier: string;
    data: Record<string, any> | null;
    timestamp: number;
}
