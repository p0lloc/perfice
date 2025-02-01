import type {Goal} from "@perfice/model/goal/goal";
import {AsyncStore} from "../store";
import type {GoalService} from "@perfice/services/goal/goal";
import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
import { EntityObserverType } from "@perfice/services/observer";
import {writable, type Writable} from "svelte/store";
import {dateToMidnight} from "@perfice/util/time/simple";


export function GoalDate(): Writable<Date> {
    return writable(dateToMidnight(new Date()));
}

export class GoalStore extends AsyncStore<Goal[]> {

    private goalService: GoalService;

    constructor(goalService: GoalService) {
        super(goalService.getGoals());
        this.goalService = goalService;

        this.goalService.addObserver(EntityObserverType.CREATED, async (goal) => await this.onGoalCreated(goal));
        this.goalService.addObserver(EntityObserverType.UPDATED, async (goal) => await this.onGoalUpdated(goal));
        this.goalService.addObserver(EntityObserverType.DELETED, async (goal) => await this.onGoalDeleted(goal));
    }

    createGoal(name: string, aggregateVariableId: string): Promise<void> {
        return this.goalService.createGoal(name, aggregateVariableId);
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


}
