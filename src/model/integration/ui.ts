export interface SelectedField {
    integrationField: string | null;
    questionId: string;
}

export interface UnauthenticatedIntegrationError {
    integrationTypeName: string;
    forms: string[];
}