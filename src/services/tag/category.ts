import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";
import type {TagCategory} from "@perfice/model/tag/tag";
import type {TagCategoryCollection} from "@perfice/db/collections";

export class TagCategoryService {
    private collection: TagCategoryCollection;

    private observers: EntityObservers<TagCategory>;

    constructor(collection: TagCategoryCollection) {
        this.collection = collection;
        this.observers = new EntityObservers();
    }

    async getCategories(): Promise<TagCategory[]> {
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

    async updateCategory(category: TagCategory): Promise<void> {
        await this.collection.updateCategory(category);
        await this.observers.notifyObservers(EntityObserverType.UPDATED, category);
    }

    async deleteCategoryById(categoryId: string): Promise<void> {
        let category = await this.collection.getCategoryById(categoryId);
        if(category == null) return;
        await this.collection.deleteCategoryById(categoryId);
        await this.observers.notifyObservers(EntityObserverType.DELETED, category);
    }

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<TagCategory>) {
        this.observers.addObserver(type, callback);
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<TagCategory>) {
        this.observers.removeObserver(type, callback);
    }

}
