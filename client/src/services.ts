import {TrackableService} from "@perfice/services/trackable/trackable";
import {BaseJournalService, JournalEntryObserverType, type JournalService} from "@perfice/services/journal/journal";
import {TagEntryService} from "@perfice/services/tag/entry";
import {VariableGraph} from "@perfice/services/variable/graph";
import {WeekStart} from "@perfice/model/variable/time/time";
import {VariableService} from "@perfice/services/variable/variable";
import {EntityObserverType} from "@perfice/services/observer";
import type {JournalEntry, TagEntry} from "@perfice/model/journal/journal";
import {BaseFormService, type FormService} from "@perfice/services/form/form";
import {AnalyticsSettingsService} from "@perfice/services/analytics/settings";
import {CorrelationIgnoreService} from "@perfice/services/analytics/ignore";
import {TrackableCategoryService} from "@perfice/services/trackable/category";
import {GoalService} from "@perfice/services/goal/goal";
import {TagService} from "@perfice/services/tag/tag";
import {FormTemplateService} from "@perfice/services/form/template";
import {DashboardService} from "@perfice/services/dashboard/dashboard";
import {DashboardWidgetService} from "@perfice/services/dashboard/widget";
import {TagCategoryService} from "@perfice/services/tag/category";
import {EntryImportService} from "@perfice/services/import/formEntries/import";
import {EntryExportService} from "@perfice/services/export/formEntries/export";
import {NotificationService} from "@perfice/services/notification/notification";
import {ReflectionService} from "@perfice/services/reflection/reflection";
import {JournalSearchService} from "@perfice/services/journal/search";
import {AnalyticsService} from "@perfice/services/analytics/analytics";
import {AnalyticsHistoryService} from "@perfice/services/analytics/history";
import type {Collections} from "@perfice/db/collections";
import {CompleteExportService} from "@perfice/services/export/complete/complete";
import type {Table} from "dexie";
import type {Form} from "@perfice/model/form/form";
import {CompleteImportService} from "@perfice/services/import/complete/complete";
import type {MigrationService} from "@perfice/db/migration/migration";
import {DeletionService} from "@perfice/services/deletion/deletion";
import {IntegrationService} from "./services/integration/integration";
import {AuthService} from "@perfice/services/auth/auth";
import {EncryptionService} from "@perfice/services/encryption/encryption";
import {SyncService} from "./services/sync/sync";
import {RemoteService} from "@perfice/services/remote/remote";
import {UpdateOperation} from "./model/sync/sync";
import type {Variable} from "@perfice/model/variable/variable";
import {LocalIntegrationService} from "@perfice/services/integration/local";

export interface Services {
    readonly trackable: TrackableService;
    readonly journal: JournalService;
    readonly variableGraph: VariableGraph;
    readonly variable: VariableService;
    readonly form: FormService;
    readonly analyticsSettings: AnalyticsSettingsService;
    readonly ignore: CorrelationIgnoreService;
    readonly trackableCategory: TrackableCategoryService;
    readonly goal: GoalService;
    readonly tag: TagService;
    readonly tagEntry: TagEntryService;
    readonly formTemplate: FormTemplateService;
    readonly dashboard: DashboardService;
    readonly dashboardWidget: DashboardWidgetService;
    readonly tagCategory: TagCategoryService;
    readonly import: EntryImportService;
    readonly export: EntryExportService;
    readonly notification: NotificationService;
    readonly reflection: ReflectionService;
    readonly journalSearch: JournalSearchService;
    readonly analytics: AnalyticsService;
    readonly analyticsHistory: AnalyticsHistoryService;
    readonly completeExport: CompleteExportService;
    readonly completeImport: CompleteImportService;
    readonly deletion: DeletionService;
    readonly integration: IntegrationService;
    readonly auth: AuthService;
    readonly encryption: EncryptionService;
    readonly sync: SyncService;
    readonly remote: RemoteService;
    readonly localIntegration: LocalIntegrationService;
}

export async function setupServices(db: Collections, tables: Record<string, Table>,
                                    migrationService: MigrationService, weekStart: WeekStart, provideSyncService: (s: SyncService) => void): Promise<Services> {

    const journalService = new BaseJournalService(db.entries);
    const tagEntryService = new TagEntryService(db.tagEntries);
    const graph = new VariableGraph(db.indices, db.entries, db.tagEntries, weekStart);

    const variableService = new VariableService(db.variables, db.indices, graph);
    variableService.addObserver(EntityObserverType.CREATED, async (v: Variable) => graph.onVariableCreated(v));
    variableService.addObserver(EntityObserverType.UPDATED, async (v: Variable) => graph.onVariableUpdated(v));
    variableService.addObserver(EntityObserverType.DELETED, async (v: Variable) => graph.onVariableDeleted(v.id));

    tagEntryService.addObserver(EntityObserverType.CREATED, async (e: TagEntry) => await variableService.onTagEntryCreated(e));
    tagEntryService.addObserver(EntityObserverType.DELETED, async (e: TagEntry) => await variableService.onTagEntryDeleted(e));
    journalService.addEntryObserver(JournalEntryObserverType.CREATED, async (e: JournalEntry) => await variableService.onEntryCreated(e));
    journalService.addEntryObserver(JournalEntryObserverType.DELETED, async (e: JournalEntry) => await variableService.onEntryDeleted(e));
    journalService.addEntryObserver(JournalEntryObserverType.UPDATED, async (e: JournalEntry, previous: JournalEntry | null) =>
        await variableService.onEntryUpdated(e, previous));

    // Variables must be loaded if they are going to be updated by integration updates
    await variableService.loadVariables();

    const formService = new BaseFormService(db.forms, db.formSnapshots);
    formService.initLazyDependencies(journalService);


    const analyticsSettingsService = new AnalyticsSettingsService(db.analyticsSettings);
    formService.addObserver(EntityObserverType.DELETED,
        async (e: Form) => await analyticsSettingsService.onFormDeleted(e));
    formService.addObserver(EntityObserverType.DELETED, async (e: Form) => await integrationService.onFormDeleted(e));

    const ignoreService = new CorrelationIgnoreService();
    ignoreService.load();

    const goalService = new GoalService(db.goals, variableService);
    const trackableService = new TrackableService(db.trackables, variableService, formService, analyticsSettingsService, goalService);
    const trackableCategoryService = new TrackableCategoryService(db.trackableCategories);
    trackableCategoryService.addObserver(EntityObserverType.DELETED, async (category) =>
        await trackableService.onTrackableCategoryDeleted(category));

    const tagService = new TagService(db.tags, variableService, tagEntryService);
    const formTemplateService = new FormTemplateService(db.formTemplates);

    const dashboardService = new DashboardService(db.dashboards);
    const dashboardWidgetService = new DashboardWidgetService(db.dashboardWidgets, variableService);

    const tagCategoryService = new TagCategoryService(db.tagCategories, tagService);
    const importService = new EntryImportService(journalService, variableService);
    const exportService = new EntryExportService(journalService, formService);
    const notificationService = new NotificationService(db.notifications);

    const reflectionService = new ReflectionService(db.reflections, formService, journalService, tagService, variableService, notificationService);
    const remoteService = new RemoteService();
    const authService = new AuthService(remoteService);
    remoteService.setAuthService(authService);

    const journalSearchService = new JournalSearchService(db.entries, db.tagEntries,
        trackableService, tagService, formService, db.savedSearches);

    const analyticsService = new AnalyticsService(formService, db.entries, db.tags, db.tagEntries, weekStart);
    const analyticsHistoryService = new AnalyticsHistoryService(0.5, 0.3);
    analyticsHistoryService.load();

    const completeImportService = new CompleteImportService(tables, analyticsHistoryService, ignoreService, migrationService,
        tagService, tagCategoryService, trackableService, trackableCategoryService, formService);

    const encryptionService = new EncryptionService(db.encryptionKey);

    const completeExportService = new CompleteExportService(tables, analyticsHistoryService, ignoreService, migrationService);
    const deletionService = new DeletionService(tables);
    const syncService = new SyncService(encryptionService, migrationService, db.updateQueue,
        db.transaction, tables, remoteService, authService);

    setupSyncObservers(syncService, journalService, tagEntryService, graph, variableService);

    // This is quite order dependent, sync service must be synced before fetching integration updates
    provideSyncService(syncService);

    const localIntegrationService = new LocalIntegrationService(db.localIntegrations);

    // Integration service is instantiated after sync service, so it will register its observer after the sync service.
    const integrationService = new IntegrationService(journalService, formService, remoteService, authService, localIntegrationService);
    await authService.load();

    return {
        trackable: trackableService,
        journal: journalService,
        variableGraph: graph,
        variable: variableService,
        form: formService,
        analyticsSettings: analyticsSettingsService,
        ignore: ignoreService,
        trackableCategory: trackableCategoryService,
        goal: goalService,
        tag: tagService,
        tagEntry: tagEntryService,
        formTemplate: formTemplateService,
        dashboard: dashboardService,
        dashboardWidget: dashboardWidgetService,
        tagCategory: tagCategoryService,
        import: importService,
        export: exportService,
        notification: notificationService,
        reflection: reflectionService,
        journalSearch: journalSearchService,
        analytics: analyticsService,
        analyticsHistory: analyticsHistoryService,
        completeExport: completeExportService,
        completeImport: completeImportService,
        deletion: deletionService,
        integration: integrationService,
        auth: authService,
        encryption: encryptionService,
        sync: syncService,
        remote: remoteService,
        localIntegration: localIntegrationService,
    }
}

function setupSyncObservers(syncService: SyncService, journalService: JournalService, tagEntryService: TagEntryService, graph: VariableGraph, variableService: VariableService) {
    syncService.addObserver("entries", async (updates) => {
        for (let update of updates) {
            switch (update.operation) {
                case UpdateOperation.CREATE:
                    await journalService.notifyObservers(JournalEntryObserverType.CREATED, update.data, null);
                    break;
                case UpdateOperation.DELETE:
                    await journalService.notifyObservers(JournalEntryObserverType.DELETED, update.previous, null);
                    break;
                case UpdateOperation.PUT:
                    await journalService.notifyObservers(JournalEntryObserverType.UPDATED, update.data, update.previous);
                    break;
                case UpdateOperation.FULL_SYNC:
                    await graph.deleteIndices();
                    break;
            }
        }
    });

    syncService.addObserver("tagEntries", async (updates) => {
        for (let update of updates) {
            switch (update.operation) {
                case UpdateOperation.CREATE:
                    await tagEntryService.notifyObservers(EntityObserverType.CREATED, update.data);
                    break;
                case UpdateOperation.DELETE:
                    await tagEntryService.notifyObservers(EntityObserverType.DELETED, update.previous);
                    break;
                case UpdateOperation.PUT:
                    await tagEntryService.notifyObservers(EntityObserverType.UPDATED, update.data);
                    break;
                case UpdateOperation.FULL_SYNC:
                    await graph.deleteIndices();
                    break;
            }
        }
    });

    syncService.addObserver("variables", async (updates) => {
        for (let update of updates) {
            switch (update.operation) {
                case UpdateOperation.CREATE:
                    await variableService.notifyObservers(EntityObserverType.CREATED, variableService.deserializeVariable(update.data));
                    break;
                case UpdateOperation.DELETE:
                    await variableService.notifyObservers(EntityObserverType.DELETED, update.previous);
                    break;
                case UpdateOperation.PUT:
                    await variableService.notifyObservers(EntityObserverType.UPDATED, variableService.deserializeVariable(update.data));
                    break;
                case UpdateOperation.FULL_SYNC:
                    await graph.deleteIndices();
                    break;
            }
        }
    });
}