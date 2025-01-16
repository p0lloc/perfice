import Dexie, {type EntityTable} from "dexie";
import type {Trackable} from "@perfice/model/trackable/trackable";

const db = new Dexie('perfice-db') as Dexie & {
    trackables: EntityTable<Trackable, 'id'>;
}

db.version(0).stores({
    "trackables": "id"
});
