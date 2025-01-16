import Dexie, {type EntityTable} from "dexie";
import type {Trackable} from "@perfice/model/trackable/trackable";

type DexieDB = Dexie & {
    trackables: EntityTable<Trackable, 'id'>;
};

export function setupDb(): DexieDB {
    const db = new Dexie('perfice-db') as DexieDB;
    db.version(1).stores({
        "trackables": "id"
    });

    return db;
}
