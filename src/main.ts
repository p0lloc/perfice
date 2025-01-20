import {mount} from 'svelte'
import './app.css'
import App from './App.svelte'
import {TrackableService} from "@perfice/services/trackable/trackable";
import {VariableService} from "@perfice/services/variable/variable";
import {setupDb} from "@perfice/db/dexie/db";
import {DexieTrackableCollection} from "@perfice/db/dexie/trackable";
import {TrackableDate, TrackableStore} from "@perfice/stores/trackable/trackable";
import type {TrackableCollection, VariableCollection} from "@perfice/db/collections";
import {DexieVariableCollection} from "@perfice/db/dexie/variable";
import {DexieJournalCollection} from "@perfice/db/dexie/journal";
import {DexieIndexCollection} from './db/dexie';
import {type TimeScope, WeekStart} from "@perfice/model/variable/time/time";
import {VariableGraph} from "@perfice/services/variable/graph";
import {JournalEntryObserverType, JournalService} from "@perfice/services/journal/journal";
import {JournalEntryStore} from "@perfice/stores/journal/entry";
import type {JournalEntry} from './model/journal/journal';
import {VariableStore} from "@perfice/stores/variable/value";
import {writable} from "svelte/store";
import {DexieTrackableCategoryCollection} from "@perfice/db/dexie/category";
import {TrackableCategoryService} from "@perfice/model/trackable/category";
import {TrackableCategoryStore} from "@perfice/stores/trackable/category";
import { CategorizedTrackables } from './stores/trackable/categorized';

const db = setupDb();
const trackableCollection: TrackableCollection = new DexieTrackableCollection(db.trackables);
const variableCollection: VariableCollection = new DexieVariableCollection(db.variables);
const journalCollection = new DexieJournalCollection(db.entries);
const journalService = new JournalService(journalCollection);
const trackableCategoryCollection = new DexieTrackableCategoryCollection(db.trackableCategories);

const indexCollection = new DexieIndexCollection(db.indices);
const graph = new VariableGraph(indexCollection, journalCollection, WeekStart.MONDAY);

const variableService = new VariableService(variableCollection, indexCollection, graph);
journalService.addEntryObserver(JournalEntryObserverType.CREATED, async (e: JournalEntry) => {
    await variableService.onEntryCreated(e);
});
journalService.addEntryObserver(JournalEntryObserverType.DELETED, async (e: JournalEntry) => {
    await variableService.onEntryDeleted(e);
});
journalService.addEntryObserver(JournalEntryObserverType.UPDATED, async (e: JournalEntry) => {
    await variableService.onEntryUpdated(e);
});

const trackableService = new TrackableService(trackableCollection, variableService);
const trackableCategoryService = new TrackableCategoryService(trackableCategoryCollection);

export const trackables = new TrackableStore(trackableService);
export const trackableDate = TrackableDate();
export const weekStart = writable(WeekStart.MONDAY);
export const trackableCategories = new TrackableCategoryStore(trackableCategoryService);
export const journal = new JournalEntryStore(journalService);
export const categorizedTrackables = CategorizedTrackables();

export const appReady = writable(false);

// TODO: where do we actually want to put stores? we don't want to expose the services directly
export function variable(id: string, timeContext: TimeScope) {
    return VariableStore(id, timeContext, variableService);
}

(async () => {
    await variableService.loadVariables();
    appReady.set(true);
})();

const app = mount(App, {
    target: document.getElementById('app')!,
})

export default app
