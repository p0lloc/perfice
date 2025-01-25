import Dexie, {type EntityTable} from "dexie";
import type {Trackable, TrackableCategory} from "@perfice/model/trackable/trackable";
import type {StoredVariable, VariableIndex} from "@perfice/model/variable/variable";
import type {JournalEntry} from "@perfice/model/journal/journal";
import type {Form, FormSnapshot} from "@perfice/model/form/form";

type DexieDB = Dexie & {
    trackables: EntityTable<Trackable, 'id'>;
    variables: EntityTable<StoredVariable, 'id'>;
    entries: EntityTable<JournalEntry, 'id'>;
    indices: EntityTable<VariableIndex, 'id'>;
    trackableCategories: EntityTable<TrackableCategory, 'id'>;
    forms: EntityTable<Form, 'id'>;
    formSnapshots: EntityTable<FormSnapshot, 'id'>;
};

export function setupDb(): DexieDB {
    const db = new Dexie('perfice-db') as DexieDB;
    db.version(5).stores({
        "trackables": "id",
        "variables": "id",
        "entries": "id, formId, snapshotId, [formId+timestamp]",
        "indices": "id, variableId, [variableId+timeScope]",
        "trackableCategories": "id",
        "forms": "id",
        "formSnapshots": "id, formId"
    });

    return db;
}
