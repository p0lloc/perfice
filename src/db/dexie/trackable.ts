import type {TrackableCollection} from "@perfice/db/collections";
import {Dexie, type EntityTable} from "dexie";
import type {Trackable} from "@perfice/model/trackable/trackable";

export class DexieTrackableCollection implements TrackableCollection {

    private table: EntityTable<Trackable, "id">;

    constructor(table: EntityTable<Trackable, "id">) {
        this.table = table;
    }

    getTrackables(): Promise<Trackable[]> {
        return this.table.toArray();
    }

    async getTrackableById(id: string): Promise<Trackable | undefined> {
        return this.table.get(id);
    }

    async createTrackable(trackable: Trackable): Promise<void> {
        await this.table.add(trackable);
    }

    async updateTrackable(trackable: Trackable): Promise<void> {
        await this.table.put(trackable);
    }
    async deleteTrackableById(trackableId: string): Promise<void> {
        await this.table.delete(trackableId);
    }

}
