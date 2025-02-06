import type {GoalCollection} from "@perfice/db/collections";
import type {Goal} from "@perfice/model/goal/goal";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";
import type {VariableService} from "@perfice/services/variable/variable";
import {type Variable} from "@perfice/model/variable/variable";

export class GoalService {

    private goalCollection: GoalCollection;
    private observers: EntityObservers<Goal> = new EntityObservers();

    private variableService: VariableService;

    constructor(goalCollection: GoalCollection, variableService: VariableService) {
        this.goalCollection = goalCollection;
        this.variableService = variableService;
    }

    async getGoals(): Promise<Goal[]> {
        return await this.goalCollection.getGoals();
    }

    async getGoalById(id: string): Promise<Goal | undefined> {
        return await this.goalCollection.getGoalById(id);
    }

    async createGoal(name: string, variable: Variable): Promise<void> {
        let goal: Goal = {
            id: crypto.randomUUID(),
            variableId: variable.id,
            name,
        };

        await this.goalCollection.createGoal(goal);
        await this.observers.notifyObservers(EntityObserverType.CREATED, goal);
    }

    async updateGoal(goal: Goal) {
        await this.goalCollection.updateGoal(goal);
        await this.observers.notifyObservers(EntityObserverType.UPDATED, goal);
    }


    async deleteGoalById(id: string) {
        let goal = await this.goalCollection.getGoalById(id);
        if (goal == null) return;

        await this.goalCollection.deleteGoalById(id);
        await this.variableService.deleteVariableAndDependencies(goal.variableId);
        await this.observers.notifyObservers(EntityObserverType.DELETED, goal);
    }

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<Goal>) {
        this.observers.addObserver(type, callback);
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<Goal>) {
        this.observers.removeObserver(type, callback);
    }

}
