import {mount} from 'svelte'
import './app.css'
import App from './App.svelte'
import {TrackableService} from "@perfice/services/trackable/trackable";
import {VariableService} from "@perfice/services/variable/variable";
import {setupDb} from "@perfice/db/dexie/db";
import {DexieTrackableCollection} from "@perfice/db/dexie/trackable";
import {TrackableStore} from "@perfice/stores/trackable/trackable";
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

const db = setupDb();
const trackableCollection: TrackableCollection = new DexieTrackableCollection(db.trackables);
const variableCollection: VariableCollection = new DexieVariableCollection(db.variables);
const journalCollection = new DexieJournalCollection(db.entries);
const journalService = new JournalService(journalCollection);

const indexCollection = new DexieIndexCollection(db.indices);
const graph = new VariableGraph(indexCollection, journalCollection, WeekStart.MONDAY);

const variableService = new VariableService(variableCollection, indexCollection, graph);
journalService.addEntryObserver(JournalEntryObserverType.CREATED, async (e: JournalEntry) => {
    await variableService.onEntryCreated(e);
});

const trackableService = new TrackableService(trackableCollection, variableService);

export const trackables = new TrackableStore(trackableService);
export const journal = new JournalEntryStore(journalService);

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
