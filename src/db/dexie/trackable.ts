import type {TrackableCategoryCollection, TrackableCollection} from "@perfice/db/collections";
import type {Trackable, TrackableCategory} from "@perfice/model/trackable/trackable";
import type {SyncedTable} from "@perfice/services/sync/sync";

export class DexieTrackableCollection implements TrackableCollection {

    private table: SyncedTable<Trackable>;

    constructor(table: SyncedTable<Trackable>) {
        this.table = table;
    }

    getTrackables(): Promise<Trackable[]> {
        return this.table.getAll();
    }

    async getTrackableById(id: string): Promise<Trackable | undefined> {
        return this.table.getById(id);
    }

    async createTrackable(trackable: Trackable): Promise<void> {
        await this.table.create(trackable);
    }

    async updateTrackable(trackable: Trackable): Promise<void> {
        await this.table.put(trackable);
    }

    async deleteTrackableById(trackableId: string): Promise<void> {
        await this.table.deleteById(trackableId);
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

    private table: SyncedTable<TrackableCategory>;

    constructor(table: SyncedTable<TrackableCategory>) {
        this.table = table;
    }

    async getCategories(): Promise<TrackableCategory[]> {
        return this.table.getAll();
    }

    async getCategoryById(categoryId: string): Promise<TrackableCategory | undefined> {
        return this.table.getById(categoryId);
    }

    async createCategory(category: TrackableCategory): Promise<void> {
        await this.table.create(category);
    }

    async updateCategory(category: TrackableCategory): Promise<void> {
        await this.table.put(category);
    }

    async deleteCategoryById(categoryId: string): Promise<void> {
        await this.table.deleteById(categoryId);
    }

    async count(): Promise<number> {
        return this.table.count();
    }

    async updateCategories(updatedOrdering: TrackableCategory[]): Promise<void> {
        await this.table.bulkPut(updatedOrdering);
    }

}
