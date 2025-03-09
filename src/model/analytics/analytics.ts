export interface AnalyticsSettings {
    formId: string;
    questionId: string;
    useMeanValue: Record<string, boolean>; // Question id -> boolean
}