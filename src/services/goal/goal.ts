import type {GoalCollection} from "@perfice/db/collections";
import type {Goal} from "@perfice/model/goal/goal";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";
import type {VariableService} from "@perfice/services/variable/variable";
import {type Variable, VariableTypeName} from "@perfice/model/variable/variable";
import {
    ComparisonGoalCondition,
    ComparisonOperator,
    GoalConditionType,
    GoalVariableType
} from "@perfice/services/variable/types/goal";
import {SimpleTimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";
import {pNumber, pString} from "@perfice/model/primitive/primitive";

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

    async createGoal(name: string, aggregateVariableId: string): Promise<void> {

        let variable: Variable = {
            id: crypto.randomUUID(),
            name: "",
            type: {
                type: VariableTypeName.GOAL,
                value: new GoalVariableType([
                    {
                        id: "condition1",
                        type: GoalConditionType.COMPARISON,
                        value: new ComparisonGoalCondition(
                            {constant: false, value: pString(aggregateVariableId)},
                            ComparisonOperator.GREATER_THAN,
                            {constant: true, value: pNumber(1000.0)}
                        )
                    },
                ], tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0))
            }
        };

        await this.variableService.createVariable(variable);

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
        await this.observers.notifyObservers(EntityObserverType.DELETED, goal);
    }

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<Goal>) {
        this.observers.addObserver(type, callback);
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<Goal>) {
        this.observers.removeObserver(type, callback);
    }

}
