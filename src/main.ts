import {mount} from 'svelte'
import './app.css'
import App from './App.svelte'
import {App as CapacitorApp} from '@capacitor/app';
import {TrackableService} from "@perfice/services/trackable/trackable";
import {VariableService} from "@perfice/services/variable/variable";
import {setupDb} from "@perfice/db/dexie/db";
import {TrackableDate, TrackableStore} from "@perfice/stores/trackable/trackable";
import {SimpleTimeScopeType, type TimeScope, WeekStart} from "@perfice/model/variable/time/time";
import {VariableGraph} from "@perfice/services/variable/graph";
import {JournalEntryObserverType, JournalService} from "@perfice/services/journal/journal";
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
import {GroupedJournal} from "@perfice/stores/journal/grouped";
import {GoalService} from "@perfice/services/goal/goal";
import {GoalDate, GoalStore} from "@perfice/stores/goal/goal";
import type {Goal} from "@perfice/model/goal/goal";
import {GoalValueStore} from "@perfice/stores/goal/value";
import {routingNavigatorState} from './model/ui/router.svelte';
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

const db = setupDb();
const journalService = new JournalService(db.entries);
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

const trackableService = new TrackableService(db.trackables, variableService, formService, analyticsSettingsService);
const trackableCategoryService = new TrackableCategoryService(db.trackableCategories);
const goalService = new GoalService(db.goals, variableService);
const tagService = new TagService(db.tags, variableService, tagEntryService);
const formTemplateService = new FormTemplateService(db.formTemplates);

const tagCategoryService = new TagCategoryService(db.tagCategories);
const importService = new EntryImportService(journalService);
const exportService = new EntryExportService(journalService, formService);

const analyticsService = new AnalyticsService(formService, db.entries, db.tags, db.tagEntries);

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
export const categorizedTrackables = CategorizedTrackables();
export const groupedJournal = GroupedJournal();
export const goals = new GoalStore(goalService);
export const tags = new TagStore(tagService);
export const categorizedTags = CategorizedTags();
export const variableEditProvider = new VariableEditProvider(variableService, formService, trackableService);

export const imports = new EntryImportStore(importService);
export const exports = new EntryExportStore(exportService);

export const analyticsSettings = new AnalyticsSettingsStore(analyticsSettingsService);
export const analytics = new AnalyticsStore(analyticsService, new Date(), 30, 6);

export const appReady = writable(false);

// TODO: where do we actually want to put stores? we don't want to expose the services directly
export function variableValue(id: string, timeContext: TimeScope, key: string) {
    return VariableValueStore(id, timeContext, variableService, key);
}

export function trackableValue(trackable: Trackable, date: Date, weekStart: WeekStart, key: string) {
    return TrackableValueStore(trackable, date, weekStart, key, variableService);
}

export function tagValue(tag: Tag, date: Date, weekStart: WeekStart, key: string) {
    return TagValueStore(tag, date, weekStart, key, variableService);
}

export function goalValue(goal: Goal, date: Date, weekStart: WeekStart, key: string) {
    return GoalValueStore(goal, date, weekStart, key, variableService);
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

(async () => {
    await variables.get();
    appReady.set(true);
})();

const app = mount(App, {
    target: document.getElementById('app')!,
});

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

export default app
