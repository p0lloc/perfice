import type { EntityTable } from "dexie";
import type { TrackableCategoryCollection } from "../collections";
import type {TrackableCategory} from "@perfice/model/trackable/trackable";

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

}
