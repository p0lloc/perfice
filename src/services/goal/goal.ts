import type {GoalCollection} from "@perfice/db/collections";
import type {Goal} from "@perfice/model/goal/goal";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";
import type {VariableService} from "@perfice/services/variable/variable";
import {type Variable, VariableTypeName} from "@perfice/model/variable/variable";
import type {GoalConditionValueResult} from "@perfice/stores/goal/value";
import {GoalConditionType} from "@perfice/services/variable/types/goal";

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

    async createGoal(name: string, color: string, variable: Variable, streakVariable: Variable): Promise<Goal> {
        let goal: Goal = {
            id: crypto.randomUUID(),
            variableId: variable.id,
            color,
            name,
            streakVariableId: streakVariable.id,
        };

        await this.goalCollection.createGoal(goal);
        await this.observers.notifyObservers(EntityObserverType.CREATED, goal);

        return goal;
    }

    async updateGoalVariable(previous: Goal, goal: Goal) {
        if (goal.name == previous.name) return;
        let variable = this.variableService.getVariableById(goal.variableId);
        if (variable == null) return;

        variable.name = goal.name;
        await this.variableService.updateVariable(variable);
    }

    async updateGoal(goal: Goal) {
        let previous = await this.getGoalById(goal.id);
        if (previous == null) return;

        await this.updateGoalVariable(previous, goal);

        await this.goalCollection.updateGoal(goal);
        await this.observers.notifyObservers(EntityObserverType.UPDATED, goal);
    }

    async deleteGoalById(id: string) {
        let goal = await this.goalCollection.getGoalById(id);
        if (goal == null) return;

        await this.goalCollection.deleteGoalById(id);
        await this.observers.notifyObservers(EntityObserverType.DELETED, goal);
        await this.variableService.deleteVariableAndDependencies(goal.variableId,
            (v) => v.type.type != VariableTypeName.GOAL); // Don't delete goal met condition dependencies, that would delete a completely different goal
    }

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<Goal>) {
        this.observers.addObserver(type, callback);
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<Goal>) {
        this.observers.removeObserver(type, callback);
    }

    async getGoalByVariableId(goalVariableId: string): Promise<Goal | undefined> {
        return this.goalCollection.getGoalByVariableId(goalVariableId);
    }
}


export function areGoalConditionsMet(results: GoalConditionValueResult[]): boolean {
    for (let value of results) {
        if (value.type == GoalConditionType.GOAL_MET && !value.value.met) return false;
        if (value.type == GoalConditionType.COMPARISON && !value.value.met) return false;
    }

    return true;
}
