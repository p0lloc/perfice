import {TrackableDate, TrackableStore} from "@perfice/stores/trackable/trackable";
import type {Services} from "@perfice/services";
import {FormStore} from "@perfice/stores/form/form";
import {VariableStore} from "@perfice/stores/variable/variable";
import {TagDate, TagStore} from "@perfice/stores/tag/tag";
import {GoalDate, GoalStore} from "@perfice/stores/goal/goal";
import {type Readable, type Writable, writable} from "svelte/store";
import {SimpleTimeScopeType, type TimeScope, WeekStart} from "@perfice/model/variable/time/time";
import {TrackableCategoryStore} from "@perfice/stores/trackable/category";
import {TagCategoryStore} from "@perfice/stores/tag/category";
import {JournalEntryStore} from "@perfice/stores/journal/entry";
import {TagEntryStore} from "@perfice/stores/journal/tag";
import {CategorizedTrackables} from "@perfice/stores/trackable/categorized";
import {GroupedJournal, type JournalDay, PaginatedJournal} from "@perfice/stores/journal/grouped";
import {CategorizedTags} from "@perfice/stores/tag/categorized";
import {VariableEditProvider} from "@perfice/stores/variable/edit";
import {ReflectionStore} from "@perfice/stores/reflection/reflection";
import type {CategoryList} from "./util/category";
import type {Trackable, TrackableCategory} from "./model/trackable/trackable";
import type {Tag, TagCategory} from "./model/tag/tag";
import {TRACKABLE_FORM_CATEGORY_DELIM, TRACKABLE_FORM_ENTITY_TYPE} from "@perfice/model/trackable/ui";
import {NotificationType} from "@perfice/model/notification/notification";
import {DashboardStore, DashboardWidgetStore} from "@perfice/stores/dashboard/dashboard";
import {EntryImportStore} from "@perfice/stores/import/formEntry";
import {EntryExportStore} from "@perfice/stores/export/formEntry";
import {OnboardingStore} from "@perfice/stores/onboarding/onboarding";
import {AnalyticsSettingsStore} from "@perfice/stores/analytics/settings";
import {AnalyticsStore} from "@perfice/stores/analytics/analytics";
import {JournalSearchStore} from "@perfice/stores/journal/search";
import {TrackableValueStore} from "@perfice/stores/trackable/value";
import type {DashboardEntryRowWidgetSettings} from "@perfice/model/dashboard/widgets/entryRow";
import {EntryRowWidget} from "@perfice/stores/dashboard/widget/entryRow";
import type {DashboardChecklistWidgetSettings} from "@perfice/model/dashboard/widgets/checklist";
import {type ChecklistData, ChecklistWidget} from "@perfice/stores/sharedWidgets/checklist/checklist";
import type {DashboardTableWidgetSettings} from "@perfice/model/dashboard/widgets/table";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
import {TableWidget} from "@perfice/stores/sharedWidgets/table/table";
import type {DashboardChartWidgetSettings} from "@perfice/model/dashboard/widgets/chart";
import {ChartWidget} from "@perfice/stores/dashboard/widget/chart";
import type {DashboardMetricWidgetSettings} from "@perfice/model/dashboard/widgets/metric";
import {MetricWidget} from "@perfice/stores/dashboard/widget/metric";
import type {DashboardInsightsWidgetSettings} from "@perfice/model/dashboard/widgets/insights";
import {InsightsWidget} from "@perfice/stores/dashboard/widget/insights";
import type {DashboardTrackableWidgetSettings} from "@perfice/model/dashboard/widgets/trackable";
import {TrackableWidget} from "@perfice/stores/dashboard/widget/trackable";
import type {DashboardGoalWidgetSettings} from "@perfice/model/dashboard/widgets/goal";
import {GoalWidget} from "@perfice/stores/dashboard/widget/goal";
import {TagValueStore} from "@perfice/stores/tag/value";
import {GoalValueStore} from "@perfice/stores/goal/value";
import {TagAnalytics, TagDetailedAnalytics} from "@perfice/stores/analytics/tags";
import {TrackableAnalytics, TrackableDetailedAnalytics} from "@perfice/stores/analytics/trackable";
import {CompleteExportStore} from "@perfice/stores/export/complete";
import {CompleteImportStore} from "@perfice/stores/import/complete";
import {WeekStartStore} from "@perfice/stores/ui/weekStart";
import {VariableValueStore} from "@perfice/stores/variable/value";
import {navigate} from "@perfice/app";
import {DeletionStore} from "@perfice/stores/deletion/deletion";

export let storeProvider: StoreProvider;
export let trackables: TrackableStore;
export let forms: FormStore;
export let variables: VariableStore;
export let trackableDate: Writable<Date>;
export let tagDate: Writable<Date>;
export let goalDate: Writable<Date>;
export let weekStart: WeekStartStore;
export let trackableCategories: TrackableCategoryStore;
export let tagCategories: TagCategoryStore;
export let journal: JournalEntryStore;
export let tagEntries: TagEntryStore;
export let categorizedTrackables: Readable<Promise<CategoryList<TrackableCategory, Trackable>[]>>;
export let goals: GoalStore;
export let tags: TagStore;
export let groupedJournal: Readable<Promise<JournalDay[]>>;
export let paginatedJournal: PaginatedJournal;
export let categorizedTags: Readable<Promise<CategoryList<TagCategory, Tag>[]>>;
export let variableEditProvider: VariableEditProvider;
export let reflections: ReflectionStore;
export let deletion: DeletionStore;

export let dashboards: DashboardStore;
export let dashboardWidgets: DashboardWidgetStore;

export let entryImports: EntryImportStore;
export let entryExports: EntryExportStore;
export let completeExport: CompleteExportStore;
export let completeImport: CompleteImportStore;
export let onboarding: OnboardingStore;

export let analyticsSettings: AnalyticsSettingsStore;
export let analytics: AnalyticsStore;
export let appReady: Writable<boolean> = writable(false);

export let journalSearch: JournalSearchStore;

export class StoreProvider {

    private readonly services: Services;

    constructor(services: Services) {
        this.services = services;
    }

    async setup(loadedWeekStart: WeekStart) {
        trackables = new TrackableStore(this.services.trackable);
        forms = new FormStore(this.services.form, this.services.formTemplate);
        variables = new VariableStore(this.services.variable);

        trackableDate = TrackableDate();
        tagDate = TagDate();
        goalDate = GoalDate();
        completeExport = new CompleteExportStore(this.services.completeExport);
        completeImport = new CompleteImportStore(this.services.completeImport);
        weekStart = new WeekStartStore(loadedWeekStart);
        weekStart.addObserver(v => {
            this.services.analytics.setWeekStart(v);
            this.services.variableGraph.setWeekStart(v);
        });

        trackableCategories = new TrackableCategoryStore(this.services.trackableCategory);
        tagCategories = new TagCategoryStore(this.services.tagCategory);
        journal = new JournalEntryStore(this.services.journal);
        tagEntries = new TagEntryStore(this.services.tagEntry);
        categorizedTrackables = CategorizedTrackables();
        goals = new GoalStore(this.services.goal);
        tags = new TagStore(this.services.tag);
        groupedJournal = GroupedJournal();
        paginatedJournal = new PaginatedJournal();
        categorizedTags = CategorizedTags();
        variableEditProvider = new VariableEditProvider(this.services.variable, this.services.form, this.services.trackable);
        reflections = new ReflectionStore(this.services.reflection);
        deletion = new DeletionStore(this.services.deletion);

        forms.addEntityFormCreateListener((entityType, form) => {
            if (!entityType.startsWith(TRACKABLE_FORM_ENTITY_TYPE)) return;

            let parts = entityType.split(TRACKABLE_FORM_CATEGORY_DELIM);
            trackables.onTrackableFromFormCreated(form, parts.length == 2 ? parts[1] : null);
            navigate("/trackables");
        })

        this.services.notification.addNotificationClickedListener(NotificationType.REFLECTION, async (entityId) => {
            await reflections.onNotificationClicked(entityId);
        });


        dashboards = new DashboardStore(this.services.dashboard);
        dashboardWidgets = new DashboardWidgetStore(this.services.dashboardWidget);

        entryImports = new EntryImportStore(this.services.import);
        entryExports = new EntryExportStore(this.services.export);
        onboarding = new OnboardingStore(this.services.trackable, this.services.trackableCategory,
            this.services.tag, this.services.tagCategory, this.services.dashboard,
            this.services.dashboardWidget, this.services.variable, this.services.goal, this.services.reflection);

        analyticsSettings = new AnalyticsSettingsStore(this.services.analyticsSettings);
        analytics = new AnalyticsStore(this.services.analytics, this.services.analyticsSettings, this.services.analyticsHistory, this.services.ignore, new Date(), 60, 6);

        journalSearch = new JournalSearchStore(this.services.journalSearch, this.services.form, this.services.trackable,
            this.services.trackableCategory, this.services.tag, this.services.tagCategory);
    }

    trackableValue(trackable: Trackable, date: Date, weekStart: WeekStart, key: string) {
        return TrackableValueStore(trackable, date, weekStart, key, this.services.variable);
    }

    entryRowWidget(dependencies: Record<string, string>, settings: DashboardEntryRowWidgetSettings, date: Date,
                   weekStart: WeekStart, key: string,) {
        return EntryRowWidget(dependencies, settings, date, weekStart, key, this.services.variable);
    }

    checklistWidget(dependencies: Record<string, string>, settings: DashboardChecklistWidgetSettings, date: Date,
                    weekStart: WeekStart, key: string, extraData: ChecklistData[] = []) {
        return ChecklistWidget(dependencies, settings, date, weekStart, this.services.variable, key, extraData);
    }

    tableWidget(listVariableId: string, settings: DashboardTableWidgetSettings, date: Date,
                weekStart: WeekStart, key: string,
                extraAnswers: Record<string, PrimitiveValue>[] = []) {
        return TableWidget(listVariableId, settings, date, weekStart, key, this.services.variable, extraAnswers);
    }

    chartWidget(dependencies: Record<string, string>, settings: DashboardChartWidgetSettings, date: Date,
                weekStart: WeekStart, key: string,) {
        return ChartWidget(dependencies, settings, date, weekStart, key, this.services.variable);
    }

    metricWidget(dependencies: Record<string, string>, settings: DashboardMetricWidgetSettings, date: Date,
                 weekStart: WeekStart, key: string,) {
        return MetricWidget(dependencies, settings, date, weekStart, key, this.services.variable);
    }

    insightsWidget(settings: DashboardInsightsWidgetSettings, date: Date) {
        return InsightsWidget(settings, date);
    }

    trackableWidget(settings: DashboardTrackableWidgetSettings) {
        return TrackableWidget(settings);
    }

    goalWidget(settings: DashboardGoalWidgetSettings, date: Date,
               weekStart: WeekStart, key: string) {
        return GoalWidget(settings, date, weekStart, key);
    }


    tagValue(tag: Tag, date: Date, weekStart: WeekStart, key: string) {
        return TagValueStore(tag, date, weekStart, key, this.services.variable);
    }

    variableValue(variableId: string, timeContext: TimeScope, key: string) {
        return VariableValueStore(variableId, timeContext, this.services.variable, key);
    }

    goalValue(goalVariableId: string, goalStreakVariableId: string, date: Date, weekStart: WeekStart, key: string) {
        return GoalValueStore(goalVariableId, goalStreakVariableId, date, weekStart, key, this.services.variable);
    }

    tagAnalytics() {
        return TagAnalytics();
    }

    trackableDetailedAnalytics(id: string, questionId: string | null, timeScope: SimpleTimeScopeType) {
        return TrackableDetailedAnalytics(id, questionId, timeScope, this.services.trackable, this.services.form, this.services.analyticsSettings, this.services.analytics);
    }

    tagDetailedAnalytics(id: string, timeScope: SimpleTimeScopeType) {
        return TagDetailedAnalytics(id, timeScope, this.services.analytics);
    }

    trackableAnalytics() {
        return TrackableAnalytics();
    }

}

export async function setupStores(services: Services, weekStart: WeekStart) {
    storeProvider = new StoreProvider(services);
    await storeProvider.setup(weekStart);
}

export function trackableValue(trackable: Trackable, date: Date, weekStart: WeekStart, key: string) {
    return storeProvider.trackableValue(trackable, date, weekStart, key);
}

export function entryRowWidget(dependencies: Record<string, string>, settings: DashboardEntryRowWidgetSettings, date: Date, weekStart: WeekStart, key: string,) {
    return storeProvider.entryRowWidget(dependencies, settings, date, weekStart, key);
}

export function checklistWidget(dependencies: Record<string, string>, settings: DashboardChecklistWidgetSettings, date: Date, weekStart: WeekStart, key: string, extraData: ChecklistData[] = []) {
    return storeProvider.checklistWidget(dependencies, settings, date, weekStart, key, extraData);
}

export function tableWidget(listVariableId: string, settings: DashboardTableWidgetSettings, date: Date, weekStart: WeekStart, key: string, extraAnswers: Record<string, PrimitiveValue>[] = []) {
    return storeProvider.tableWidget(listVariableId, settings, date, weekStart, key, extraAnswers);
}

export function chartWidget(dependencies: Record<string, string>, settings: DashboardChartWidgetSettings, date: Date, weekStart: WeekStart, key: string,) {
    return storeProvider.chartWidget(dependencies, settings, date, weekStart, key);
}

export function metricWidget(dependencies: Record<string, string>, settings: DashboardMetricWidgetSettings, date: Date, weekStart: WeekStart, key: string,) {
    return storeProvider.metricWidget(dependencies, settings, date, weekStart, key);
}

export function insightsWidget(settings: DashboardInsightsWidgetSettings, date: Date) {
    return storeProvider.insightsWidget(settings, date);
}

export function trackableWidget(settings: DashboardTrackableWidgetSettings) {
    return storeProvider.trackableWidget(settings);
}

export function goalWidget(settings: DashboardGoalWidgetSettings, date: Date, weekStart: WeekStart, key: string) {
    return storeProvider.goalWidget(settings, date, weekStart, key);
}

export function tagValue(tag: Tag, date: Date, weekStart: WeekStart, key: string) {
    return storeProvider.tagValue(tag, date, weekStart, key);
}

export function variableValue(variableId: string, timeContext: TimeScope, key: string) {
    return storeProvider.variableValue(variableId, timeContext, key);
}

export function goalValue(goalVariableId: string, goalStreakVariableId: string, date: Date, weekStart: WeekStart, key: string) {
    return storeProvider.goalValue(goalVariableId, goalStreakVariableId, date, weekStart, key);
}

export function tagAnalytics() {
    return storeProvider.tagAnalytics();
}

export function trackableDetailedAnalytics(id: string, questionId: string | null, timeScope: SimpleTimeScopeType) {
    return storeProvider.trackableDetailedAnalytics(id, questionId, timeScope);
}

export function tagDetailedAnalytics(id: string, timeScope: SimpleTimeScopeType) {
    return storeProvider.tagDetailedAnalytics(id, timeScope);
}

export function trackableAnalytics() {
    return storeProvider.trackableAnalytics();
}