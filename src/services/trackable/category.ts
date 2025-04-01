import type {TrackableCategoryCollection} from "@perfice/db/collections";
import type {TrackableCategory} from "../../model/trackable/trackable";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";

export interface TrackableCategoryEntityProvider {
    getCategories(): Promise<TrackableCategory[]>;
}

export class TrackableCategoryService implements TrackableCategoryEntityProvider {
    private collection: TrackableCategoryCollection;

    private observers: EntityObservers<TrackableCategory>;

    constructor(collection: TrackableCategoryCollection) {
        this.collection = collection;
        this.observers = new EntityObservers();
    }

    async getCategories(): Promise<TrackableCategory[]> {
        return this.collection.getCategories();
    }

    async createCategory(name: string): Promise<void> {
        let category = {
            id: crypto.randomUUID(),
            name
        }

        await this.collection.createCategory(category);
        await this.observers.notifyObservers(EntityObserverType.CREATED, category);
    }

    async updateCategory(category: TrackableCategory): Promise<void> {
        await this.collection.updateCategory(category);
        await this.observers.notifyObservers(EntityObserverType.UPDATED, category);
    }

    async deleteCategoryById(categoryId: string): Promise<void> {
        let category = await this.collection.getCategoryById(categoryId);
        if (category == null) return;
        await this.collection.deleteCategoryById(categoryId);
        await this.observers.notifyObservers(EntityObserverType.DELETED, category);
    }

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<TrackableCategory>) {
        this.observers.addObserver(type, callback);
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<TrackableCategory>) {
        this.observers.removeObserver(type, callback);
    }

}
