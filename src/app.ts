import {App as CapacitorApp} from '@capacitor/app';
import {TrackableService} from "@perfice/services/trackable/trackable";
import {VariableService} from "@perfice/services/variable/variable";
import {setupDb} from "@perfice/db/dexie/db";
import {TrackableDate, TrackableStore} from "@perfice/stores/trackable/trackable";
import {SimpleTimeScopeType, type TimeScope, WeekStart} from "@perfice/model/variable/time/time";
import {VariableGraph} from "@perfice/services/variable/graph";
import {BaseJournalService, JournalEntryObserverType} from "@perfice/services/journal/journal";
import {JournalEntryStore} from "@perfice/stores/journal/entry";
import type {JournalEntry, TagEntry} from './model/journal/journal';
import {VariableValueStore} from "@perfice/stores/variable/value";
import {writable} from "svelte/store";
import {TrackableCategoryService} from "@perfice/services/trackable/category";
import {TrackableCategoryStore} from "@perfice/stores/trackable/category";
import {CategorizedTrackables} from './stores/trackable/categorized';
import type {Trackable} from "@perfice/model/trackable/trackable";
import {TrackableValueStore} from "@perfice/stores/trackable/value";
import {BaseFormService} from "@perfice/services/form/form";
import {FormStore} from "@perfice/stores/form/form";
import {VariableStore} from "@perfice/stores/variable/variable";
import {GroupedJournal, PaginatedJournal} from "@perfice/stores/journal/grouped";
import {GoalService} from "@perfice/services/goal/goal";
import {GoalDate, GoalStore} from "@perfice/stores/goal/goal";
import {GoalValueStore} from "@perfice/stores/goal/value";
import {routingNavigatorState} from './model/ui/router.svelte.js';
import {goto} from '@mateothegreat/svelte5-router';
import {Capacitor} from '@capacitor/core';
import {VariableEditProvider} from "@perfice/stores/variable/edit";
import {TagValueStore} from "@perfice/stores/tag/value";
import type {Tag} from './model/tag/tag';
import {TagService} from './services/tag/tag';
import {TagDate, TagStore} from "@perfice/stores/tag/tag";
import {TagEntryService} from "@perfice/services/tag/entry";
import {EntityObserverType} from "@perfice/services/observer";
import {FormTemplateService} from './services/form/template';
import {TagCategoryStore} from "@perfice/stores/tag/category";
import {TagCategoryService} from './services/tag/category';
import {CategorizedTags} from "@perfice/stores/tag/categorized";
import {EntryImportStore} from "@perfice/stores/import/import";
import {EntryImportService} from './services/import/import';
import {EntryExportService} from './services/export/export';
import {EntryExportStore} from "@perfice/stores/export/export";
import {closableState} from './model/ui/modal';
import {AnalyticsService} from './services/analytics/analytics';
import {AnalyticsStore} from "@perfice/stores/analytics/analytics";
import {AnalyticsSettingsStore} from './stores/analytics/settings';
import {AnalyticsSettingsService} from './services/analytics/settings';
import {TrackableAnalytics, TrackableDetailedAnalytics} from "@perfice/stores/analytics/trackable";
import {TagAnalytics, TagDetailedAnalytics} from "@perfice/stores/analytics/tags";
import {TagEntryStore} from './stores/journal/tag';
import {AnalyticsHistoryService} from "@perfice/services/analytics/history";
import {DashboardService} from './services/dashboard/dashboard';
import {DashboardWidgetService} from './services/dashboard/widget';
import {DashboardStore, DashboardWidgetStore} from "@perfice/stores/dashboard/dashboard";
import {EntryRowWidget} from "@perfice/stores/dashboard/widget/entryRow";
import type {DashboardEntryRowWidgetSettings} from "@perfice/model/dashboard/widgets/entryRow";
import type {DashboardChartWidgetSettings} from "@perfice/model/dashboard/widgets/chart";
import {ChartWidget} from "@perfice/stores/dashboard/widget/chart";
import type {DashboardTableWidgetSettings} from "@perfice/model/dashboard/widgets/table";
import {GoalWidget} from "@perfice/stores/dashboard/widget/goal";
import type {DashboardGoalWidgetSettings} from "@perfice/model/dashboard/widgets/goal";
import {MetricWidget} from "@perfice/stores/dashboard/widget/metric";
import type {DashboardMetricWidgetSettings} from "@perfice/model/dashboard/widgets/metric";
import {TrackableWidget} from './stores/dashboard/widget/trackable';
import type {DashboardTrackableWidgetSettings} from "@perfice/model/dashboard/widgets/trackable";
import type {DashboardInsightsWidgetSettings} from "@perfice/model/dashboard/widgets/insights";
import {InsightsWidget} from "@perfice/stores/dashboard/widget/insights";
import type {DashboardChecklistWidgetSettings} from './model/dashboard/widgets/checklist';
import {ReflectionService} from "@perfice/services/reflection/reflection";
import {ReflectionStore} from "@perfice/stores/reflection/reflection";
import {TableWidget} from "@perfice/stores/sharedWidgets/table/table";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
import {type ChecklistData, ChecklistWidget} from "@perfice/stores/sharedWidgets/checklist/checklist";
import {JournalSearchService} from "@perfice/services/journal/search";
import {JournalSearchStore} from "@perfice/stores/journal/search";
import {CorrelationIgnoreService} from './services/analytics/ignore';
import {LocalNotifications} from "@capacitor/local-notifications";
import {NotificationService} from "@perfice/services/notification/notification";
import {setupServiceWorker} from "@perfice/swSetup";
import {NotificationType} from "@perfice/model/notification/notification";
import {registerDataTypes} from "@perfice/model/form/data";
import {TRACKABLE_FORM_CATEGORY_DELIM, TRACKABLE_FORM_ENTITY_TYPE} from "@perfice/model/trackable/ui";

const db = setupDb();
const journalService = new BaseJournalService(db.entries);
const tagEntryService = new TagEntryService(db.tagEntries);
const graph = new VariableGraph(db.indices, db.entries, db.tagEntries, WeekStart.MONDAY);

const variableService = new VariableService(db.variables, db.indices, graph);
tagEntryService.addObserver(EntityObserverType.CREATED, async (e: TagEntry) => await variableService.onTagEntryCreated(e));
tagEntryService.addObserver(EntityObserverType.DELETED, async (e: TagEntry) => await variableService.onTagEntryDeleted(e));
journalService.addEntryObserver(JournalEntryObserverType.CREATED, async (e: JournalEntry) => await variableService.onEntryCreated(e));
journalService.addEntryObserver(JournalEntryObserverType.DELETED, async (e: JournalEntry) => await variableService.onEntryDeleted(e));
journalService.addEntryObserver(JournalEntryObserverType.UPDATED, async (e: JournalEntry) => await variableService.onEntryUpdated(e));

const formService = new BaseFormService(db.forms, db.formSnapshots);
formService.initLazyDependencies(journalService);

const analyticsSettingsService = new AnalyticsSettingsService(db.analyticsSettings);
const ignoreService = new CorrelationIgnoreService();
ignoreService.load();

const trackableService = new TrackableService(db.trackables, variableService, formService, analyticsSettingsService);
const trackableCategoryService = new TrackableCategoryService(db.trackableCategories);
const goalService = new GoalService(db.goals, variableService);
const tagService = new TagService(db.tags, variableService, tagEntryService);
const formTemplateService = new FormTemplateService(db.formTemplates);

const dashboardService = new DashboardService(db.dashboards);
const dashboardWidgetService = new DashboardWidgetService(db.dashboardWidgets, variableService);

const tagCategoryService = new TagCategoryService(db.tagCategories, tagService);
const importService = new EntryImportService(journalService);
const exportService = new EntryExportService(journalService, formService);
const notificationService = new NotificationService(db.notifications, WeekStart.MONDAY);

const reflectionService = new ReflectionService(db.reflections, formService, journalService, tagService, variableService, notificationService);

const journalSearchService = new JournalSearchService(db.entries, db.tagEntries,
    trackableService, tagService, formService, db.savedSearches);

const analyticsService = new AnalyticsService(formService, db.entries, db.tags, db.tagEntries);
const analyticsHistoryService = new AnalyticsHistoryService(0.5, 0.3);
analyticsHistoryService.load();

export const trackables = new TrackableStore(trackableService);
export const forms = new FormStore(formService, formTemplateService);
export const variables = new VariableStore(variableService);
export const trackableDate = TrackableDate();
export const tagDate = TagDate();
export const goalDate = GoalDate();
export const weekStart = writable(WeekStart.MONDAY);
export const trackableCategories = new TrackableCategoryStore(trackableCategoryService);
export const tagCategories = new TagCategoryStore(tagCategoryService);
export const journal = new JournalEntryStore(journalService);
export const tagEntries = new TagEntryStore(tagEntryService);
export const categorizedTrackables = CategorizedTrackables();
export const goals = new GoalStore(goalService);
export const tags = new TagStore(tagService);
export const groupedJournal = GroupedJournal();
export const paginatedJournal = new PaginatedJournal();
export const categorizedTags = CategorizedTags();
export const variableEditProvider = new VariableEditProvider(variableService, formService, trackableService);
export const reflections = new ReflectionStore(reflectionService);

forms.addEntityFormCreateListener((entityType, form) => {
    if (!entityType.startsWith(TRACKABLE_FORM_ENTITY_TYPE)) return;

    let parts = entityType.split(TRACKABLE_FORM_CATEGORY_DELIM);
    trackables.onTrackableFromFormCreated(form, parts.length == 2 ? parts[1] : null);
    goto("/trackables");
})

notificationService.addNotificationClickedListener(NotificationType.REFLECTION, async (entityId) => {
    await reflections.onNotificationClicked(entityId);
});

export const dashboards = new DashboardStore(dashboardService);
export const dashboardWidgets = new DashboardWidgetStore(dashboardWidgetService);

export const imports = new EntryImportStore(importService);
export const exports = new EntryExportStore(exportService);

export const analyticsSettings = new AnalyticsSettingsStore(analyticsSettingsService);
export const analytics = new AnalyticsStore(analyticsService, analyticsSettingsService, analyticsHistoryService, ignoreService, new Date(), 60, 6);

export const appReady = writable(false);

export const journalSearch = new JournalSearchStore(journalSearchService, formService, trackableService,
    trackableCategoryService, tagService, tagCategoryService);

// TODO: where do we actually want to put stores? we don't want to expose the services directly
export function variableValue(id: string, timeContext: TimeScope, key: string) {
    return VariableValueStore(id, timeContext, variableService, key);
}

export function trackableValue(trackable: Trackable, date: Date, weekStart: WeekStart, key: string) {
    return TrackableValueStore(trackable, date, weekStart, key, variableService);
}

export function entryRowWidget(dependencies: Record<string, string>, settings: DashboardEntryRowWidgetSettings, date: Date,
                               weekStart: WeekStart, key: string,) {
    return EntryRowWidget(dependencies, settings, date, weekStart, key, variableService);
}

export function checklistWidget(dependencies: Record<string, string>, settings: DashboardChecklistWidgetSettings, date: Date,
                                weekStart: WeekStart, key: string, extraData: ChecklistData[] = []) {
    return ChecklistWidget(dependencies, settings, date, weekStart, variableService, key, extraData);
}

export function tableWidget(listVariableId: string, settings: DashboardTableWidgetSettings, date: Date,
                            weekStart: WeekStart, key: string,
                            extraAnswers: Record<string, PrimitiveValue>[] = []) {
    return TableWidget(listVariableId, settings, date, weekStart, key, variableService, extraAnswers);
}

export function chartWidget(dependencies: Record<string, string>, settings: DashboardChartWidgetSettings, date: Date,
                            weekStart: WeekStart, key: string,) {
    return ChartWidget(dependencies, settings, date, weekStart, key, variableService);
}


export function metricWidget(dependencies: Record<string, string>, settings: DashboardMetricWidgetSettings, date: Date,
                             weekStart: WeekStart, key: string,) {
    return MetricWidget(dependencies, settings, date, weekStart, key, variableService);
}


export function insightsWidget(settings: DashboardInsightsWidgetSettings, date: Date) {
    return InsightsWidget(settings, date);
}

export function trackableWidget(settings: DashboardTrackableWidgetSettings) {
    return TrackableWidget(settings);
}

export function goalWidget(settings: DashboardGoalWidgetSettings, date: Date,
                           weekStart: WeekStart, key: string) {
    return GoalWidget(settings, date, weekStart, key);
}

export function tagValue(tag: Tag, date: Date, weekStart: WeekStart, key: string) {
    return TagValueStore(tag, date, weekStart, key, variableService);
}

export function goalValue(goalVariableId: string, date: Date, weekStart: WeekStart, key: string) {
    return GoalValueStore(goalVariableId, date, weekStart, key, variableService);
}

export function trackableAnalytics() {
    return TrackableAnalytics();
}

export function tagAnalytics() {
    return TagAnalytics();
}

export function trackableDetailedAnalytics(id: string, questionId: string | null, timeScope: SimpleTimeScopeType) {
    return TrackableDetailedAnalytics(id, questionId, timeScope, trackableService, formService, analyticsSettingsService, analyticsService);
}

export function tagDetailedAnalytics(id: string, timeScope: SimpleTimeScopeType) {
    return TagDetailedAnalytics(id, timeScope, analyticsService);
}

registerDataTypes();

(async () => {
    await variables.get();
    setupServiceWorker();
    appReady.set(true);
    await notificationService.scheduleStoredNotifications();
    onAppOpened();
})();

LocalNotifications.addListener('localNotificationActionPerformed', async (data) => {
    await notificationService.onNotificationClicked(data.notification.extra);
});

function onAppOpened() {
    // Give precedence to any reflections opened by notifications
    setTimeout(() => reflections.onAppOpened(), 500);
}

/**
 * Goes to the previous route (or closes the opened modal).
 * Exits the app on mobile if there are no more routes in history.
 */
export async function back() {
    let closableClose = closableState.pop();
    if (closableClose != undefined) {
        closableClose();
        return true;
    }

    let currentRoute = routingNavigatorState.pop();
    if (currentRoute != null) {
        let previousRoute = routingNavigatorState.pop();
        if (previousRoute != null) {
            goto(previousRoute);
            return;
        }
    }

    // Exit app on mobile and go to root route on web
    if (Capacitor.getPlatform() != "web") {
        await CapacitorApp.exitApp();
    } else {
        goto("/");
    }
}

CapacitorApp.addListener("backButton", back);
CapacitorApp.addListener('appStateChange', ({isActive}) => {
    if (!isActive) return;

    onAppOpened();
});
