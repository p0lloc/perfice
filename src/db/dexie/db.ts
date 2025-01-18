import Dexie, {type EntityTable} from "dexie";
import type {Trackable} from "@perfice/model/trackable/trackable";
import type {StoredVariable, VariableIndex} from "@perfice/model/variable/variable";
import type {JournalEntry} from "@perfice/model/journal/journal";

type DexieDB = Dexie & {
    trackables: EntityTable<Trackable, 'id'>;
    variables: EntityTable<StoredVariable, 'id'>;
    entries: EntityTable<JournalEntry, 'id'>;
    indices: EntityTable<VariableIndex, 'id'>;
};

export function setupDb(): DexieDB {
    const db = new Dexie('perfice-db') as DexieDB;
    db.version(2).stores({
        "trackables": "id",
        "variables": "id",
        "entries": "id, formId, [formId+timestamp]",
        "indices": "id, variableId, [variableId+timeScope]"
    });

    return db;
}
