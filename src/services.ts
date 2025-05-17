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
}

export function setupServices(db: Collections, tables: Record<string, Table>,
                              migrationService: MigrationService, weekStart: WeekStart): Services {

    const journalService = new BaseJournalService(db.entries);
    const tagEntryService = new TagEntryService(db.tagEntries);
    const graph = new VariableGraph(db.indices, db.entries, db.tagEntries, weekStart);

    const variableService = new VariableService(db.variables, db.indices, graph);
    tagEntryService.addObserver(EntityObserverType.CREATED, async (e: TagEntry) => await variableService.onTagEntryCreated(e));
    tagEntryService.addObserver(EntityObserverType.DELETED, async (e: TagEntry) => await variableService.onTagEntryDeleted(e));
    journalService.addEntryObserver(JournalEntryObserverType.CREATED, async (e: JournalEntry) => await variableService.onEntryCreated(e));
    journalService.addEntryObserver(JournalEntryObserverType.DELETED, async (e: JournalEntry) => await variableService.onEntryDeleted(e));
    journalService.addEntryObserver(JournalEntryObserverType.UPDATED, async (e: JournalEntry) => await variableService.onEntryUpdated(e));

    const formService = new BaseFormService(db.forms, db.formSnapshots);
    formService.initLazyDependencies(journalService);


    const analyticsSettingsService = new AnalyticsSettingsService(db.analyticsSettings);
    formService.addObserver(EntityObserverType.DELETED,
        async (e: Form) => await analyticsSettingsService.onFormDeleted(e));

    const ignoreService = new CorrelationIgnoreService();
    ignoreService.load();

    const trackableService = new TrackableService(db.trackables, variableService, formService, analyticsSettingsService);
    const trackableCategoryService = new TrackableCategoryService(db.trackableCategories);
    trackableCategoryService.addObserver(EntityObserverType.DELETED, async (category) =>
        await trackableService.onTrackableCategoryDeleted(category));

    const goalService = new GoalService(db.goals, variableService);
    const tagService = new TagService(db.tags, variableService, tagEntryService);
    const formTemplateService = new FormTemplateService(db.formTemplates);

    const dashboardService = new DashboardService(db.dashboards);
    const dashboardWidgetService = new DashboardWidgetService(db.dashboardWidgets, variableService);

    const tagCategoryService = new TagCategoryService(db.tagCategories, tagService);
    const importService = new EntryImportService(journalService, variableService);
    const exportService = new EntryExportService(journalService, formService);
    const notificationService = new NotificationService(db.notifications);

    const reflectionService = new ReflectionService(db.reflections, formService, journalService, tagService, variableService, notificationService);

    const journalSearchService = new JournalSearchService(db.entries, db.tagEntries,
        trackableService, tagService, formService, db.savedSearches);

    const analyticsService = new AnalyticsService(formService, db.entries, db.tags, db.tagEntries, weekStart);
    const analyticsHistoryService = new AnalyticsHistoryService(0.5, 0.3);
    analyticsHistoryService.load();

    const completeImportService = new CompleteImportService(tables, analyticsHistoryService, ignoreService, migrationService,
        tagService, tagCategoryService, trackableService, trackableCategoryService, formService);

    const completeExportService = new CompleteExportService(tables, analyticsHistoryService, ignoreService, migrationService);
    const deletionService = new DeletionService(tables);

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
        deletion: deletionService
    }
}