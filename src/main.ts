import { mount } from 'svelte'
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
import { DexieIndexCollection } from './db/dexie';
import {WeekStart} from "@perfice/model/variable/time/time";
import {VariableGraph} from "@perfice/services/variable/graph";

const db = setupDb();
const trackableCollection: TrackableCollection = new DexieTrackableCollection(db.trackables);
const variableCollection: VariableCollection = new DexieVariableCollection(db.variables);
const journalCollection = new DexieJournalCollection(db.entries);
const indexCollection = new DexieIndexCollection(db.indices);
const graph = new VariableGraph(indexCollection, journalCollection, WeekStart.MONDAY);

const variableService = new VariableService(variableCollection, graph);
variableService.loadVariables();
const trackableService = new TrackableService(trackableCollection, variableService);

export const trackables = new TrackableStore(trackableService);

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
