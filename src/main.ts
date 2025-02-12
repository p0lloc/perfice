import {mount} from 'svelte'
import './app.css'
import App from './App.svelte'
import {App as CapacitorApp} from '@capacitor/app';
import {TrackableService} from "@perfice/services/trackable/trackable";
import {VariableService} from "@perfice/services/variable/variable";
import {setupDb} from "@perfice/db/dexie/db";
import {TrackableDate, TrackableStore} from "@perfice/stores/trackable/trackable";
import {type TimeScope, WeekStart} from "@perfice/model/variable/time/time";
import {VariableGraph} from "@perfice/services/variable/graph";
import {JournalEntryObserverType, JournalService} from "@perfice/services/journal/journal";
import {JournalEntryStore} from "@perfice/stores/journal/entry";
import type {JournalEntry} from './model/journal/journal';
import {VariableValueStore} from "@perfice/stores/variable/value";
import {writable} from "svelte/store";
import {TrackableCategoryService} from "@perfice/model/trackable/category";
import {TrackableCategoryStore} from "@perfice/stores/trackable/category";
import { CategorizedTrackables } from './stores/trackable/categorized';
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
import { modalNavigatorState } from './model/ui/modal';
import { routingNavigatorState } from './model/ui/router.svelte';
import { goto } from '@mateothegreat/svelte5-router';
import { Capacitor } from '@capacitor/core';
import {VariableEditProvider} from "@perfice/stores/variable/edit";

const db = setupDb();
const journalService = new JournalService(db.entries);
const graph = new VariableGraph(db.indices, db.entries, WeekStart.MONDAY);

const variableService = new VariableService(db.variables, db.indices, graph);
journalService.addEntryObserver(JournalEntryObserverType.CREATED, async (e: JournalEntry) => {
    await variableService.onEntryCreated(e);
});
journalService.addEntryObserver(JournalEntryObserverType.DELETED, async (e: JournalEntry) => {
    await variableService.onEntryDeleted(e);
});
journalService.addEntryObserver(JournalEntryObserverType.UPDATED, async (e: JournalEntry) => {
    await variableService.onEntryUpdated(e);
});

const formService = new BaseFormService(db.forms, db.formSnapshots);
formService.initLazyDependencies(journalService);

const trackableService = new TrackableService(db.trackables, variableService, formService);
const trackableCategoryService = new TrackableCategoryService(db.trackableCategories);
const goalService = new GoalService(db.goals, variableService);

export const trackables = new TrackableStore(trackableService);
export const forms = new FormStore(formService);
export const variables = new VariableStore(variableService);
export const trackableDate = TrackableDate();
export const goalDate = GoalDate();
export const weekStart = writable(WeekStart.MONDAY);
export const trackableCategories = new TrackableCategoryStore(trackableCategoryService);
export const journal = new JournalEntryStore(journalService);
export const categorizedTrackables = CategorizedTrackables();
export const groupedJournal = GroupedJournal();
export const goals = new GoalStore(goalService);
export const variableEditProvider = new VariableEditProvider(variableService, formService, trackableService);

export const appReady = writable(false);

// TODO: where do we actually want to put stores? we don't want to expose the services directly
export function variableValue(id: string, timeContext: TimeScope, key: string) {
    return VariableValueStore(id, timeContext, variableService, key);
}

export function trackableValue(trackable: Trackable, date: Date, weekStart: WeekStart, key: string) {
    return TrackableValueStore(trackable, date, weekStart, key, variableService);
}

export function goalValue(goal: Goal, date: Date, weekStart: WeekStart, key: string) {
    return GoalValueStore(goal, date, weekStart, key, variableService);
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
    let modalRoute = modalNavigatorState.pop();
    if (modalRoute != undefined) {
        modalRoute.close();
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
