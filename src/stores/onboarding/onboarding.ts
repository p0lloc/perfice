import {type OnboardingSelection, OnboardingSelectType} from "@perfice/model/onboarding/onboarding";
import {goto} from "@mateothegreat/svelte5-router";
import {TRACKABLE_SUGGESTIONS} from "@perfice/model/trackable/suggestions";
import type {TrackableService} from "@perfice/services/trackable/trackable";
import type {TrackableCategoryService} from "@perfice/services/trackable/category";
import type {TagService} from "@perfice/services/tag/tag";
import type {TagCategoryService} from "@perfice/services/tag/category";
import type {Trackable} from "@perfice/model/trackable/trackable";
import type {Form} from "@perfice/model/form/form";
import {Capacitor} from "@capacitor/core";
import type {DashboardService} from "@perfice/services/dashboard/dashboard";
import type {DashboardWidgetService} from "@perfice/services/dashboard/widget";
import {DASHBOARD_SUGGESTIONS, manipulateSuggestionWidgetSettings} from "@perfice/model/dashboard/suggestions";
import {CURRENT_DASHBOARD_KEY} from "@perfice/model/dashboard/ui";
import type {VariableService} from "@perfice/services/variable/variable";
import type {GoalService} from "@perfice/services/goal/goal";
import {createGoalSuggestion, GOAL_SUGGESTIONS} from "@perfice/model/goal/suggestions";

const ONBOARDING_KEY = "onboarded";
const FINISH_ROUTE = "/";

export const ONBOARDING_ROUTE = "/onboarding";

export class OnboardingStore {

    private trackableService: TrackableService;
    private trackableCategoryService: TrackableCategoryService;
    private tagService: TagService;
    private tagCategoryService: TagCategoryService;

    private dashboardService: DashboardService;
    private dashboardWidgetService: DashboardWidgetService;
    private variableService: VariableService;
    private goalService: GoalService;

    constructor(trackableService: TrackableService, trackableCategoryService: TrackableCategoryService,
                tagService: TagService, tagCategoryService: TagCategoryService,
                dashboardService: DashboardService,
                dashboardWidgetService: DashboardWidgetService,
                variableService: VariableService,
                goalService: GoalService,
    ) {
        this.trackableService = trackableService;
        this.trackableCategoryService = trackableCategoryService;
        this.tagService = tagService;
        this.tagCategoryService = tagCategoryService;
        this.dashboardService = dashboardService;
        this.dashboardWidgetService = dashboardWidgetService;
        this.variableService = variableService;
        this.goalService = goalService;
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

        let createdTrackables: Map<string, {
            trackable: Trackable,
            form: Form,
            assignedQuestions: Map<string, string>
        }> = new Map();

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

                        let created = await this.trackableService.createTrackableFromSuggestion(suggestion, categoryId);
                        createdTrackables.set(suggestion.name, created);
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

        let assignedGoals = await this.createDefaultGoals(createdTrackables);

        if (Capacitor.isNativePlatform()) {
            // Mobile dashboard
        } else {
            await this.createDefaultDesktopDashboard(createdTrackables, assignedGoals);
        }

        localStorage.setItem(ONBOARDING_KEY, "true");
        goto(FINISH_ROUTE);
    }

    private async createDefaultGoals(createdTrackables: Map<string, {
        trackable: Trackable,
        form: Form,
        assignedQuestions: Map<string, string>
    }>): Promise<Map<string, string>> {
        let assignedGoals: Map<string, string> = new Map();
        for (let suggestion of GOAL_SUGGESTIONS) {
            let assignedForms = new Map(createdTrackables.entries()
                .map(([key, value]) => [key, value.form.id]));

            let assignedQuestions = new Map(createdTrackables.values()
                .flatMap(v => v.assignedQuestions.entries().toArray())
                .toArray());

            let goal = await createGoalSuggestion(suggestion, this.goalService, this.variableService,
                assignedForms, assignedQuestions, assignedGoals);

            assignedGoals.set(suggestion.name, goal.variableId);
        }

        return assignedGoals;
    }

    private async createDefaultDesktopDashboard(createdTrackables: Map<string, {
        trackable: Trackable;
        form: Form;
        assignedQuestions: Map<string, string>;
    }>, assignedGoals: Map<string, string>) {
        let dashboardSuggestion = DASHBOARD_SUGGESTIONS["desktop"];
        let dashboard = await this.dashboardService.createDashboard(dashboardSuggestion.name);
        for (let widget of dashboardSuggestion.widgets) {
            await this.dashboardWidgetService.createWidget(dashboard.id, widget.type,
                widget.display, manipulateSuggestionWidgetSettings(widget, createdTrackables, assignedGoals));
        }

        localStorage.setItem(CURRENT_DASHBOARD_KEY, dashboard.id);
    }

}