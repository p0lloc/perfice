import {AsyncStore} from "../store";
import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
import {EntityObserverType} from "@perfice/services/observer";
import type {TagCategory} from "@perfice/model/tag/tag";
import type {TagCategoryService} from "@perfice/services/tag/category";
import {emptyPromise} from "@perfice/util/promise";

export class TagCategoryStore extends AsyncStore<TagCategory[]> {

    private tagCategoryService: TagCategoryService;

    constructor(tagCategoryService: TagCategoryService) {
        super(emptyPromise());
        this.tagCategoryService = tagCategoryService;
        this.tagCategoryService.addObserver(EntityObserverType.CREATED,
            async (tag) => await this.onTagCategoryCreated(tag));
        this.tagCategoryService.addObserver(EntityObserverType.UPDATED,
            async (tag) => await this.onTagCategoryUpdated(tag));
        this.tagCategoryService.addObserver(EntityObserverType.DELETED,
            async (tag) => await this.onTagCategoryDeleted(tag));
    }

    load() {
        this.set(this.tagCategoryService.getCategories());
    }

    async createCategory(name: string): Promise<void> {
        await this.tagCategoryService.createCategory(name);
    }

    async reorderCategories(categories: TagCategory[]): Promise<void> {
        await this.tagCategoryService.reorderCategories(categories);
    }

    async deleteCategoryById(categoryId: string): Promise<void> {
        await this.tagCategoryService.deleteCategoryById(categoryId);
    }

    private async onTagCategoryCreated(tag: TagCategory) {
        this.updateResolved(v => [...v, tag]);
    }

    private async onTagCategoryDeleted(tag: TagCategory) {
        this.updateResolved(v => deleteIdentifiedInArray(v, tag.id));
    }

    private async onTagCategoryUpdated(tag: TagCategory) {
        this.updateResolved(v => updateIdentifiedInArray(v, tag));
    }

    async fetchCategories(): Promise<TagCategory[]> {
        return await this.tagCategoryService.getCategories();
    }

}
