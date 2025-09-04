export interface AnalyticsSettings {
    id: string;
    questionId: string;
    useMeanValue: Record<string, boolean>; // Question id -> boolean
    // Whether to create values between all entries with the last value
    interpolate: boolean;
}