import type {TrackableCategory} from "@perfice/model/trackable/trackable";
import {AsyncStore} from "../store";
import type {TrackableCategoryService} from "@perfice/services/trackable/category";
import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
import {EntityObserverType} from "@perfice/services/observer";

export class TrackableCategoryStore extends AsyncStore<TrackableCategory[]> {

    private trackableCategoryService: TrackableCategoryService;

    constructor(trackableCategoryService: TrackableCategoryService) {
        super(trackableCategoryService.getCategories());
        this.trackableCategoryService = trackableCategoryService;
        this.trackableCategoryService.addObserver(EntityObserverType.CREATED,
            async (trackable) => await this.onTrackableCategoryCreated(trackable));
        this.trackableCategoryService.addObserver(EntityObserverType.UPDATED,
            async (trackable) => await this.onTrackableCategoryUpdated(trackable));
        this.trackableCategoryService.addObserver(EntityObserverType.DELETED,
            async (trackable) => await this.onTrackableCategoryDeleted(trackable));
    }

    async createCategory(name: string): Promise<void> {
        await this.trackableCategoryService.createCategory(name);
    }

    async updateCategory(category: TrackableCategory): Promise<void> {
        await this.trackableCategoryService.updateCategory(category);
    }

    async deleteCategoryById(categoryId: string): Promise<void> {
        await this.trackableCategoryService.deleteCategoryById(categoryId);
    }

    async reorderCategories(categories: TrackableCategory[]): Promise<void> {
        await this.trackableCategoryService.reorderCategories(categories);
    }

    private async onTrackableCategoryCreated(trackable: TrackableCategory) {
        this.updateResolved(v => [...v, trackable]);
    }

    private async onTrackableCategoryDeleted(trackable: TrackableCategory) {
        this.updateResolved(v => deleteIdentifiedInArray(v, trackable.id));
    }

    private async onTrackableCategoryUpdated(trackable: TrackableCategory) {
        this.updateResolved(v => updateIdentifiedInArray(v, trackable));
    }

}
