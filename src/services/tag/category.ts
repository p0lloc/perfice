import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";
import type {TagCategory} from "@perfice/model/tag/tag";
import type {TagCategoryCollection} from "@perfice/db/collections";
import type {TagService} from "@perfice/services/tag/tag";
import {reorderGeneric} from "@perfice/util/array";

export interface TagCategoryEntityProvider {
    getCategories(): Promise<TagCategory[]>;
}

export class TagCategoryService implements TagCategoryEntityProvider {
    private collection: TagCategoryCollection;
    private tagService: TagService;

    private observers: EntityObservers<TagCategory>;

    constructor(collection: TagCategoryCollection, tagService: TagService) {
        this.collection = collection;
        this.tagService = tagService;
        this.observers = new EntityObservers();
    }

    async getCategories(): Promise<TagCategory[]> {
        return this.collection.getCategories();
    }

    async createCategory(name: string): Promise<TagCategory> {
        return this.createCategoryWithIdAndName(crypto.randomUUID(), name);
    }

    async createCategoryWithIdAndName(id: string, name: string): Promise<TagCategory> {
        let categoryCount = await this.collection.count();
        let category = {
            id,
            name,
            order: categoryCount
        }

        await this.collection.createCategory(category);
        await this.observers.notifyObservers(EntityObserverType.CREATED, category);
        return category;
    }

    async updateCategory(category: TagCategory): Promise<void> {
        await this.collection.updateCategory(category);
        await this.observers.notifyObservers(EntityObserverType.UPDATED, category);
    }

    async reorderCategories(categories: TagCategory[]): Promise<void> {
        let updatedOrdering = reorderGeneric(categories);
        await this.collection.updateCategories(updatedOrdering);
    }

    async deleteCategoryById(categoryId: string): Promise<void> {
        let category = await this.collection.getCategoryById(categoryId);
        if (category == null) return;

        await this.collection.deleteCategoryById(categoryId);
        await this.tagService.deleteTagsByCategoryId(categoryId);
        await this.observers.notifyObservers(EntityObserverType.DELETED, category);
    }

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<TagCategory>) {
        this.observers.addObserver(type, callback);
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<TagCategory>) {
        this.observers.removeObserver(type, callback);
    }

}
