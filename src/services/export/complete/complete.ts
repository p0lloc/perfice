import type { Table } from "dexie";
import { type AnalyticsHistoryEntry, AnalyticsHistoryService } from "@perfice/services/analytics/history";
import { CorrelationIgnoreService, type IgnoredCorrelation } from "@perfice/services/analytics/ignore";
import { CURRENT_DASHBOARD_KEY } from "@perfice/model/dashboard/ui";
import type { MigrationService } from "@perfice/db/migration/migration";

export const IGNORED_COLLECTIONS: string[] = ["indices"];

export interface NewExportFormat {
    collections: Record<string, string[]>;
    correlationsHistory: AnalyticsHistoryEntry[];
    ignoredCorrelations: IgnoredCorrelation[];
    currentDashboard: string;
    dataVersion: number;
}

export class CompleteExportService {
    private readonly collections: Record<string, Table>;
    private readonly historyService: AnalyticsHistoryService;
    private readonly ignoreService: CorrelationIgnoreService;
    private readonly migrationService: MigrationService;

    constructor(collections: Record<string, Table>,
        historyService: AnalyticsHistoryService,
        ignoreService: CorrelationIgnoreService,
        migrationService: MigrationService) {
        this.collections = collections;
        this.historyService = historyService;
        this.ignoreService = ignoreService;
        this.migrationService = migrationService;
    }

    async export(): Promise<NewExportFormat> {
        let collections = await this.exportCollections();
        let ignoredCorrelations = this.ignoreService.getIgnoredCorrelations();
        let correlationsHistory = this.historyService.getAllHistory();
        let currentDashboard = localStorage.getItem(CURRENT_DASHBOARD_KEY) ?? "";
        let dataVersion = this.migrationService.getUserVersion();

        return {
            collections: collections,
            correlationsHistory,
            ignoredCorrelations,
            currentDashboard,
            dataVersion
        };
    }

    async exportCollections(): Promise<Record<string, any[]>> {
        let result: Record<string, any[]> = {};
        for (let [key, value] of Object.entries(this.collections)) {
            if (IGNORED_COLLECTIONS.includes(key)) continue;

            result[key] = await value.toArray();
        }

        return result;
    }
}
