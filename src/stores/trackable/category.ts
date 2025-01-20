import type { TrackableCategory } from "@perfice/model/trackable/trackable";
import { AsyncStore } from "../store";
import type { TrackableCategoryService } from "@perfice/model/trackable/category";
import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";

export class TrackableCategoryStore extends AsyncStore<TrackableCategory[]> {

    private trackableCategoryService: TrackableCategoryService;

    constructor(trackableCategoryService: TrackableCategoryService) {
        super(trackableCategoryService.getCategories());
        this.trackableCategoryService = trackableCategoryService;
    }

    async createCategory(category: TrackableCategory): Promise<void> {
        await this.trackableCategoryService.createCategory(category);
        this.updateResolved(v => [...v, category]);
    }

    async updateCategory(category: TrackableCategory): Promise<void> {
        await this.trackableCategoryService.updateCategory(category);
        this.updateResolved(v => updateIdentifiedInArray(v, category));
    }

    async deleteCategoryById(categoryId: string): Promise<void> {
        await this.trackableCategoryService.deleteCategoryById(categoryId);
        this.updateResolved(v => deleteIdentifiedInArray(v, categoryId));
    }
}
