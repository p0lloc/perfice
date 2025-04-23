import {type OnboardingSelection, OnboardingSelectType} from "@perfice/model/onboarding/onboarding";
import {goto} from "@mateothegreat/svelte5-router";
import {TRACKABLE_SUGGESTIONS} from "@perfice/model/trackable/suggestions";
import type {TrackableService} from "@perfice/services/trackable/trackable";
import type {TrackableCategoryService} from "@perfice/services/trackable/category";
import type {TagService} from "@perfice/services/tag/tag";
import type {TagCategoryService} from "@perfice/services/tag/category";

const ONBOARDING_KEY = "onboarded";
const FINISH_ROUTE = "/";

export const ONBOARDING_ROUTE = "/onboarding";

export class OnboardingStore {

    private trackableService: TrackableService;
    private trackableCategoryService: TrackableCategoryService;
    private tagService: TagService;
    private tagCategoryService: TagCategoryService;

    constructor(trackableService: TrackableService, trackableCategoryService: TrackableCategoryService,
                tagService: TagService, tagCategoryService: TagCategoryService
    ) {
        this.trackableService = trackableService;
        this.trackableCategoryService = trackableCategoryService;
        this.tagService = tagService;
        this.tagCategoryService = tagCategoryService;
    }

    onboardNewUser() {
        if (localStorage.getItem(ONBOARDING_KEY) == null) {
            goto(ONBOARDING_ROUTE);
        }
    }

    private async createCategory<T extends {
        id: string
    }>(selection: OnboardingSelection, categoryIds: Map<string, string>,
       creator: (category: string) => Promise<T>): Promise<string> {

        let existingCategoryId = categoryIds.get(selection.category);
        if (existingCategoryId == null) {
            let category = await creator(selection.category);
            categoryIds.set(selection.category, category.id);
            return category.id;
        } else {
            return existingCategoryId;
        }
    }

    async finalize(selectedState: Record<OnboardingSelectType, OnboardingSelection[]>) {

        for (let [type, selections] of Object.entries(selectedState)) {
            switch (type) {
                case OnboardingSelectType.TRACKABLE: {
                    let categoryIds: Map<string, string> = new Map();
                    for (let selection of selections) {
                        let categoryId = await this.createCategory(selection, categoryIds,
                            async (name) => await this.trackableCategoryService.createCategory(name));

                        let suggestionGroup = TRACKABLE_SUGGESTIONS.find(g => g.name == selection.category);
                        if (suggestionGroup == null) continue;

                        let suggestion = suggestionGroup.suggestions.find(s => s.name == selection.item);
                        if (suggestion == null) continue;

                        await this.trackableService.createTrackableFromSuggestion(suggestion, categoryId);
                    }

                    break;
                }
                case OnboardingSelectType.TAG: {
                    let categoryIds: Map<string, string> = new Map();
                    for (let selection of selections) {
                        let categoryId = await this.createCategory(selection, categoryIds,
                            async (name) => await this.tagCategoryService.createCategory(name));

                        await this.tagService.createTag(selection.item, categoryId);
                    }

                    break;
                }
            }
        }

        localStorage.setItem(ONBOARDING_KEY, "true");
        goto(FINISH_ROUTE);
    }
}