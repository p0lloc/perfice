export interface Integration {
    id: string;
    formId: string;
    integrationType: string;
    webhook: IntegrationWebhook | null;
    entityType: string;
    fields: Record<string, string>;
    options: Record<string, string | number>;
}

export const LOCAL_INTEGRATION_TYPES: IntegrationType[] = [
    {
        integrationType: "HEALTH_CONNECT",
        authenticated: true,
        name: "Health Connect",
        logo: "",
        entities: [
            {
                name: "Steps",
                entityType: "steps",
                fields: {
                    "steps": "Steps"
                },
                options: {},
                historical: false
            },
            {
                name: "Heart rate",
                entityType: "heartRate",
                fields: {
                    "heartRate": "Heart rate"
                },
                options: {},
                historical: false
            },
        ]
    }
]

export function isLocalIntegrationType(type: string): boolean {
    return LOCAL_INTEGRATION_TYPES.some(i => i.integrationType == type);
}

export interface IntegrationWebhook {
    token: string;
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
    historical: boolean;
}

export interface IntegrationUpdate {
    id: string;
    integrationId: string;
    identifier: string;
    data: Record<string, any> | null;
    timestamp: number;
}
