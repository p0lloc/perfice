import {WeekStart} from "@perfice/model/variable/time/time";
import {derived, type Readable} from "svelte/store";
import type {DashboardGoalWidgetSettings} from "@perfice/model/dashboard/widgets/goal";
import type {GoalValueResult} from "@perfice/stores/goal/value";
import type {Goal} from "@perfice/model/goal/goal";
import {goals, goalValue} from "@perfice/stores";

export interface GoalWidgetResult {
    goal: Goal;
    value: GoalValueResult;
}

export function GoalWidget(settings: DashboardGoalWidgetSettings, date: Date,
                           weekStart: WeekStart, key: string): Readable<Promise<GoalWidgetResult>> {
    return derived(goalValue(settings.goalVariableId, settings.goalStreakVariableId, date, weekStart, key), (val, set) => {
        set(new Promise(async (resolve) => {
            let goal = await goals.getGoalByVariableId(settings.goalVariableId, true);
            if (goal == null) return;

            let value = await val;
            resolve({goal, value});
        }));
    });
}