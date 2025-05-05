import type {TrackableCategoryCollection, TrackableCollection} from "@perfice/db/collections";
import {type EntityTable} from "dexie";
import type {Trackable, TrackableCategory} from "@perfice/model/trackable/trackable";

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

    async updateTrackables(trackables: Trackable[]): Promise<void> {
        await this.table.bulkPut(trackables);
    }

    async count(): Promise<number> {
        return this.table.count();
    }

    async getTrackablesByCategoryId(id: string): Promise<Trackable[]> {
        return this.table.where("categoryId").equals(id).toArray();
    }

}

export class DexieTrackableCategoryCollection implements TrackableCategoryCollection {

    private table: EntityTable<TrackableCategory, "id">;

    constructor(table: EntityTable<TrackableCategory, "id">) {
        this.table = table;
    }

    async getCategories(): Promise<TrackableCategory[]> {
        return this.table.toArray();
    }

    async getCategoryById(categoryId: string): Promise<TrackableCategory | undefined> {
        return this.table.get(categoryId);
    }

    async createCategory(category: TrackableCategory): Promise<void> {
        await this.table.add(category);
    }

    async updateCategory(category: TrackableCategory): Promise<void> {
        await this.table.put(category);
    }

    async deleteCategoryById(categoryId: string): Promise<void> {
        await this.table.where("id").equals(categoryId).delete();
    }

    async count(): Promise<number> {
        return this.table.count();
    }

    async updateCategories(updatedOrdering: TrackableCategory[]): Promise<void> {
        await this.table.bulkPut(updatedOrdering);
    }

}
