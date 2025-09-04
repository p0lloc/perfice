import type {TrackableCategoryCollection} from "@perfice/db/collections";
import type {TrackableCategory} from "../../model/trackable/trackable";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";
import {reorderGeneric} from "@perfice/util/array";

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

    async createCategory(name: string): Promise<TrackableCategory> {
        return this.createCategoryWithIdAndName(crypto.randomUUID(), name);
    }

    async createCategoryWithIdAndName(id: string, name: string): Promise<TrackableCategory> {
        let categoryCount = await this.collection.count();
        let category: TrackableCategory = {
            id,
            name,
            order: categoryCount
        }

        await this.collection.createCategory(category);
        await this.observers.notifyObservers(EntityObserverType.CREATED, category);
        return category;
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

    async reorderCategories(categories: TrackableCategory[]): Promise<void> {
        let updatedOrdering = reorderGeneric(categories);
        await this.collection.updateCategories(updatedOrdering);
    }

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<TrackableCategory>) {
        this.observers.addObserver(type, callback);
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<TrackableCategory>) {
        this.observers.removeObserver(type, callback);
    }

}
