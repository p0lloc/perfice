import type { TrackableCategoryCollection } from "@perfice/db/collections";
import type { TrackableCategory } from "./trackable";

export class TrackableCategoryService {
    private collection: TrackableCategoryCollection;

    constructor(collection: TrackableCategoryCollection) {
        this.collection = collection;
    }

    async getCategories(): Promise<TrackableCategory[]> {
        return this.collection.getCategories();
    }

    async createCategory(category: TrackableCategory): Promise<void> {
        await this.collection.createCategory(category);
    }

    async updateCategory(category: TrackableCategory): Promise<void> {
        await this.collection.updateCategory(category);
    }

    async deleteCategoryById(categoryId: string): Promise<void> {
        await this.collection.deleteCategoryById(categoryId);
    }
}
