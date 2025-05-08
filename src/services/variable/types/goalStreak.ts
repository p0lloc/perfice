import {pNumber, type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
import {type VariableEvaluator, type VariableType, VariableTypeName} from "@perfice/model/variable/variable";
import {SimpleTimeScopeType, TimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";
import {offsetDateByTimeScope} from "@perfice/util/time/simple";

// Goal streak is always calculated based on the CURRENT date, regardless of passed in time scope.
export const GOAL_STREAK_TIME_SCOPE = tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0);

export class GoalStreakVariableType implements VariableType {

    private readonly goalVariableId: string;

    constructor(goalVariableId: string) {
        this.goalVariableId = goalVariableId;
    }

    async evaluate(evaluator: VariableEvaluator): Promise<PrimitiveValue> {
        let goalVariable = evaluator.getVariableById(this.goalVariableId);
        if (goalVariable == null || goalVariable.type.type != VariableTypeName.GOAL) {
            return pNumber(0.0);
        }

        let scope = goalVariable.type.value.getTimeScope();
        let evaluatorTimeScope = evaluator.getTimeScope();
        if (scope.type != TimeScopeType.SIMPLE || evaluatorTimeScope.type != TimeScopeType.SIMPLE) {
            return pNumber(0.0);
        }

        let streak = 0;
        for (let i = 0; i < 10; i++) {
            let offset = offsetDateByTimeScope(new Date(), scope.value.getType(), -(i + 1)); // Don't include the current date for checking streak
            let value = await evaluator.overrideTimeScope(tSimple(scope.value.getType(),
                evaluatorTimeScope.value.getWeekStart(), offset.getTime())).evaluateVariable(this.goalVariableId);

            if (value.type != PrimitiveValueType.MAP) {
                return pNumber(0.0);
            }

            if (!areAllConditionsMet(value.value)) {
                break;
            }

            streak++;
        }

        return pNumber(streak);
    }

    getDependencies(): string[] {
        return [this.goalVariableId];
    }

    getType(): VariableTypeName {
        return VariableTypeName.GOAL_STREAK;
    }

    getGoalVariableId(): string {
        return this.goalVariableId;
    }

}

function areAllConditionsMet(values: Record<string, PrimitiveValue>): boolean {
    for (let primitive of Object.values(values)) {
        switch (primitive.type) {
            case PrimitiveValueType.BOOLEAN: {
                if (!primitive.value) {
                    return false;
                }

                break;
            }

            case PrimitiveValueType.COMPARISON_RESULT: {
                if (!primitive.value.met) {
                    return false;
                }

                break;
            }
        }
    }

    return true;
}