import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import {TrackableService} from "@perfice/services/trackable/trackable";
import {VariableService} from "@perfice/services/variable/variable";
import {setupDb} from "@perfice/db/dexie/db";
import {DexieTrackableCollection} from "@perfice/db/dexie/trackable";
import {TrackableStore} from "@perfice/stores/trackable/trackable";

const db = setupDb();
const trackableCollection = new DexieTrackableCollection(db.trackables);
const variableService = new VariableService();
const trackableService = new TrackableService(trackableCollection, variableService);

export const trackables = new TrackableStore(trackableService);

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
