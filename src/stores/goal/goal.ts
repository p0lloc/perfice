import type {Goal} from "@perfice/model/goal/goal";
import {AsyncStore} from "../store";
import type {GoalService} from "@perfice/services/goal/goal";
import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
import {EntityObserverType} from "@perfice/services/observer";
import {writable, type Writable} from "svelte/store";
import {dateToMidnight} from "@perfice/util/time/simple";
import {resolvedPromise} from "@perfice/util/promise";
import type {Variable} from "@perfice/model/variable/variable";


export function GoalDate(): Writable<Date> {
    return writable(dateToMidnight(new Date()));
}

export class GoalStore extends AsyncStore<Goal[]> {

    private goalService: GoalService;

    constructor(goalService: GoalService) {
        super(resolvedPromise([]));
        this.goalService = goalService;

        this.goalService.addObserver(EntityObserverType.CREATED, async (goal) => await this.onGoalCreated(goal));
        this.goalService.addObserver(EntityObserverType.UPDATED, async (goal) => await this.onGoalUpdated(goal));
        this.goalService.addObserver(EntityObserverType.DELETED, async (goal) => await this.onGoalDeleted(goal));
    }

    load() {
        this.set(this.goalService.getGoals());
    }

    /**
     * Fetches all goals directly from the goal service, without caching.
     */
    fetchGoals(): Promise<Goal[]> {
        return this.goalService.getGoals();
    }

    /**
     * Fetches a goal directly from the goal service, without caching.
     */
    async fetchGoalById(id: string): Promise<Goal | undefined> {
        return await this.goalService.getGoalById(id);
    }

    async getGoalById(id: string): Promise<Goal | undefined> {
        let goals = await this.get();
        return goals.find(f => f.id == id);
    }

    async updateGoal(goal: Goal) {
        await this.goalService.updateGoal(goal);
    }

    async deleteGoalById(id: string) {
        await this.goalService.deleteGoalById(id);
    }

    createGoal(name: string, color: string, variable: Variable, streakVariable: Variable): Promise<Goal> {
        return this.goalService.createGoal(name, color, variable, streakVariable);
    }

    private async onGoalCreated(goal: Goal) {
        this.updateResolved(v => [...v, goal]);
    }

    private async onGoalUpdated(goal: Goal) {
        this.updateResolved(v => updateIdentifiedInArray(v, goal));
    }

    private async onGoalDeleted(goal: Goal) {
        this.updateResolved(v => deleteIdentifiedInArray(v, goal.id));
    }

    /**
     * Fetches a goal by its variable id.
     * If "fetch" is true and the goal is not cached, it will be fetched from the database.
     */
    async getGoalByVariableId(goalVariableId: string, fetch: boolean = false) {
        let goals = await this.get();
        let cached = goals.find(f => f.variableId == goalVariableId);
        if (cached != null) return cached;

        if (!fetch) return null;

        let goal = await this.goalService.getGoalByVariableId(goalVariableId);
        if (goal == null) return null;

        this.updateResolved(v => [...v, goal]);
        return goal;
    }
}
