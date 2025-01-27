import Dexie, {type EntityTable} from "dexie";
import type {Trackable, TrackableCategory} from "@perfice/model/trackable/trackable";
import type {StoredVariable, VariableIndex} from "@perfice/model/variable/variable";
import type {JournalEntry} from "@perfice/model/journal/journal";
import type {Form, FormSnapshot} from "@perfice/model/form/form";
import type {
    FormCollection,
    FormSnapshotCollection,
    IndexCollection,
    JournalCollection,
    TrackableCategoryCollection, TrackableCollection, VariableCollection
} from "@perfice/db/collections";
import {DexieTrackableCollection} from "@perfice/db/dexie/trackable";
import {DexieVariableCollection} from "@perfice/db/dexie/variable";
import {DexieJournalCollection} from "@perfice/db/dexie/journal";
import {JournalService} from "@perfice/services/journal/journal";
import {DexieTrackableCategoryCollection} from "@perfice/db/dexie/category";
import {DexieFormCollection, DexieFormSnapshotCollection} from "@perfice/db/dexie/form";
import {DexieIndexCollection} from "@perfice/db/dexie/index";

type DexieDB = Dexie & {
    trackables: EntityTable<Trackable, 'id'>;
    variables: EntityTable<StoredVariable, 'id'>;
    entries: EntityTable<JournalEntry, 'id'>;
    indices: EntityTable<VariableIndex, 'id'>;
    trackableCategories: EntityTable<TrackableCategory, 'id'>;
    forms: EntityTable<Form, 'id'>;
    formSnapshots: EntityTable<FormSnapshot, 'id'>;
};

function loadDb(): DexieDB {
    const db = new Dexie('perfice-db') as DexieDB;
    db.version(6).stores({
        "trackables": "id",
        "variables": "id",
        "entries": "id, formId, snapshotId, timestamp, [formId+timestamp]",
        "indices": "id, variableId, [variableId+timeScope]",
        "trackableCategories": "id",
        "forms": "id",
        "formSnapshots": "id, formId"
    });

    return db;
}

export interface Collections {
    entries: JournalCollection;
    formSnapshots: FormSnapshotCollection;
    forms: FormCollection;
    indices: IndexCollection;
    trackableCategories: TrackableCategoryCollection;
    trackables: TrackableCollection;
    variables: VariableCollection;
}

export function setupDb(): Collections {
    const db = loadDb();
    const trackableCollection: TrackableCollection = new DexieTrackableCollection(db.trackables);
    const variableCollection: VariableCollection = new DexieVariableCollection(db.variables);
    const journalCollection = new DexieJournalCollection(db.entries);
    const trackableCategoryCollection = new DexieTrackableCategoryCollection(db.trackableCategories);
    const formCollection = new DexieFormCollection(db.forms);
    const formSnapshotCollection = new DexieFormSnapshotCollection(db.formSnapshots);

    const indexCollection = new DexieIndexCollection(db.indices);

    return {
        entries: journalCollection,
        formSnapshots: formSnapshotCollection,
        forms: formCollection,
        indices: indexCollection,
        trackableCategories: trackableCategoryCollection,
        trackables: trackableCollection,
        variables: variableCollection
    };
}
