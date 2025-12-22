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
        logo: "https://developer.android.com/static/images/picto-icons/health-connect-logo.svg",
        entities: [
            {
                name: "Steps",
                entityType: "steps",
                fields: {
                    "steps": "Steps"
                },
                options: {},
                historical: true
            },
            {
                name: "Heart rate",
                entityType: "heartRate",
                fields: {
                    "heartRate": "Heart rate"
                },
                options: {},
                historical: true
            },
            {
                name: "Total calories burned",
                entityType: "totalCaloriesBurned",
                fields: {
                    "totalCaloriesBurned": "Total calories burned"
                },
                options: {},
                historical: true
            },

            {
                name: "Sleep",
                entityType: "sleep",
                fields: {
                    "duration": "Duration",
                },
                options: {},
                historical: true
            },

            {
                name: "Exercise",
                entityType: "exercise",
                fields: {
                    "title": "Title",
                    "duration": "Duration",
                },
                options: {},
                historical: true
            },

            {
                name: "Hydration",
                entityType: "hydration",
                fields: {
                    "hydration": "Hydration"
                },
                options: {},
                historical: true
            },
            {
                name: "Blood glucose",
                entityType: "bloodGlucose",
                fields: {
                    "bloodGlucose": "Blood glucose"
                },
                options: {},
                historical: true
            },
            {
                name: "Blood pressure",
                entityType: "bloodPressure",
                fields: {
                    "systolic": "Systolic",
                    "diastolic": "Diastolic"
                },
                options: {},
                historical: true
            },
            {
                name: "Height",
                entityType: "height",
                fields: {
                    "height": "Height"
                },
                options: {},
                historical: true
            },
            {
                name: "Weight",
                entityType: "weight",
                fields: {
                    "weight": "Weight"
                },
                options: {},
                historical: true
            },
            {
                name: "Nutrition",
                entityType: "nutrition",
                fields: {
                    "name": "Name",
                    "carbs": "Carbohydrates",
                    "calories": "Calories",
                    "protein": "Protein",
                    "fat": "Fat"
                },
                options: {},
                historical: true
            }
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
