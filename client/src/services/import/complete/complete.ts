import type {Table} from "dexie";
import {readTextFile} from "@perfice/services/import/formEntries/import";
import type {NewExportFormat} from "@perfice/services/export/complete/complete";
import type {AnalyticsHistoryService} from "@perfice/services/analytics/history";
import type {CorrelationIgnoreService} from "@perfice/services/analytics/ignore";
import {CURRENT_DASHBOARD_KEY} from "@perfice/model/dashboard/ui";
import type {MigrationService} from "@perfice/db/migration/migration";
import {OldFormatImporter} from "@perfice/services/import/complete/oldFormat";
import type {TagService} from "@perfice/services/tag/tag";
import type {TagCategoryService} from "@perfice/services/tag/category";
import type {TrackableService} from "@perfice/services/trackable/trackable";
import type {TrackableCategoryService} from "@perfice/services/trackable/category";
import type {FormService} from "@perfice/services/form/form";

export class CompleteImportService {

    private readonly tables: Record<string, Table>;

    private readonly historyService: AnalyticsHistoryService;
    private readonly ignoreService: CorrelationIgnoreService;
    private readonly migrationService: MigrationService;

    private readonly oldFormatImporter: OldFormatImporter;

    constructor(tables: Record<string, Table>,
                historyService: AnalyticsHistoryService,
                ignoreService: CorrelationIgnoreService,
                migrationService: MigrationService,
                tagService: TagService,
                tagCategoryService: TagCategoryService,
                trackableService: TrackableService,
                trackableCategoryService: TrackableCategoryService,
                formService: FormService,
    ) {
        this.tables = tables;
        this.historyService = historyService;
        this.ignoreService = ignoreService;
        this.migrationService = migrationService;
        this.oldFormatImporter = new OldFormatImporter(tables, tagService, tagCategoryService, trackableService, trackableCategoryService, formService);
    }

    async import(file: File, newFormat: boolean): Promise<void> {
        let raw = await readTextFile(file);
        let data: any = JSON.parse(raw);
        if (typeof data != "object") throw new Error("Invalid data");

        if (newFormat) {
            await this.importNewFormat(data);
        } else {
            await this.oldFormatImporter.import(data);
        }
    }

    async importNewFormat(data: NewExportFormat) {
        await this.importCollections(data.collections);
        this.historyService.importHistory(data.correlationsHistory);
        this.ignoreService.importIgnoredCorrelations(data.ignoredCorrelations);
        this.migrationService.saveUserVersion(data.dataVersion);

        localStorage.setItem(CURRENT_DASHBOARD_KEY, data.currentDashboard);
    }

    private async importCollections(data: Record<string, any[]>) {
        for (let [key, value] of Object.entries(data)) {
            let table = this.tables[key];
            if (table == undefined) continue;

            if (!Array.isArray(value)) throw new Error("Invalid data");

            await table.clear();
            await table.bulkPut(value);
        }
    }

}