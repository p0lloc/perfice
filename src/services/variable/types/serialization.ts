import {type VariableType, VariableTypeName} from "@perfice/model/variable/variable";
import {AggregateVariableType} from "@perfice/services/variable/types/aggregate";
import {ListVariableType} from "@perfice/services/variable/types/list";
import {
    ComparisonGoalCondition, type GoalCondition,
    GoalConditionType,
    type GoalConditionValue, GoalMetGoalCondition,
    GoalVariableType
} from "@perfice/services/variable/types/goal";
import {deserializeTimeScope, serializeTimeScope} from "@perfice/model/variable/time/serialization";
import {WeekStart} from "@perfice/model/variable/time/time";
import {CalculationVariableType} from "@perfice/services/variable/types/calculation";
import {TagVariableType} from "@perfice/services/variable/types/tag";

export const GOAL_CONDITION_DESERIALIZERS:
    Record<string, (value: any) => GoalConditionValue> = {
    [GoalConditionType.COMPARISON]: (value: any) => new ComparisonGoalCondition(
        value.source,
        value.operator,
        value.target,
    ),
    [GoalConditionType.GOAL_MET]: (value: any) => new GoalMetGoalCondition(value.goalVariableId)
}

export const GOAL_CONDITION_SERIALIZERS: Record<GoalConditionType, (value: GoalConditionValue) => object> = {
    [GoalConditionType.COMPARISON]: (value: GoalConditionValue) => {
        let comparison = value as ComparisonGoalCondition;
        return {
            source: comparison.getSource(),
            operator: comparison.getOperator(),
            target: comparison.getTarget(),
        }
    },
    [GoalConditionType.GOAL_MET]: (value: GoalConditionValue) => {
        let goalMet = value as GoalMetGoalCondition;
        return {
            goalVariableId: goalMet.getGoalVariableId()
        };
    }
}

function deserializeGoalCondition(object: any): GoalCondition {
    let type: GoalConditionType = object.type;
    let deserializer = GOAL_CONDITION_DESERIALIZERS[type];
    if (deserializer === undefined) {
        throw new Error(`Unknown goal condition type: ${type}`);
    }

    let value = deserializer(object.value);
    return {
        id: object.id,
        type: object.type,
        // @ts-ignore
        value,
    }
}

function serializeGoalCondition(condition: GoalCondition): object {
    let serializer = GOAL_CONDITION_SERIALIZERS[condition.type];
    if (serializer === undefined) {
        throw new Error(`Unknown goal condition type: ${condition.type}`);
    }

    let value = serializer(condition.value);
    return {
        id: condition.id,
        type: condition.type,
        value,
    }
}

export const VARIABLE_TYPE_DESERIALIZERS: Record<VariableTypeName, (value: any) => VariableType> = {
    [VariableTypeName.LIST]: (value: any) => new ListVariableType(
        value.formId,
        value.fields,
        value.filters
    ),
    [VariableTypeName.AGGREGATE]: (value: any) => new AggregateVariableType(
        value.aggregateType,
        value.listVariableId,
        value.field,
    ),
    [VariableTypeName.GOAL]: (value: any) => new GoalVariableType(
        value.conditions.map(deserializeGoalCondition),
        deserializeTimeScope(value.timeScope, WeekStart.MONDAY), // TODO: do we pass in week start?
    ),
    [VariableTypeName.CALCULATION]: (value: any) => new CalculationVariableType(
        value.entries,
    ),
    [VariableTypeName.TAG]: (value: any) => new TagVariableType(value.tagId),
};

export const VARIABLE_TYPE_SERIALIZERS: Record<VariableTypeName, (value: VariableType) => object> = {
    [VariableTypeName.LIST]: (value: VariableType) => {
        let listType = value as ListVariableType;
        return {
            formId: listType.getFormId(),
            fields: listType.getFields(),
            filters: listType.getFilters(),
        }
    },
    [VariableTypeName.AGGREGATE]: (value: VariableType) => {
        let aggregateType = value as AggregateVariableType;
        return {
            aggregateType: aggregateType.getAggregateType(),
            listVariableId: aggregateType.getListVariableId(),
            field: aggregateType.getField(),
        };
    },
    [VariableTypeName.GOAL]: (value: VariableType) => {
        let goalType = value as GoalVariableType;
        return {
            conditions: goalType.getConditions().map(c => serializeGoalCondition(c)),
            timeScope: serializeTimeScope(goalType.getTimeScope()),
        }
    },
    [VariableTypeName.CALCULATION]: (value: VariableType) => {
        let calculationType = value as CalculationVariableType;
        return {
            entries: calculationType.getEntries(),
        }
    },
    [VariableTypeName.TAG]: (value: VariableType) => {
        let tagType = value as TagVariableType;
        return {
            tagId: tagType.getTagId()
        }
    },
}

export function serializeVariableType(type: VariableType): object {
    let serializer = VARIABLE_TYPE_SERIALIZERS[type.getType()];
    if (serializer === undefined) {
        throw new Error(`Unknown variable type: ${type.getType()}`);
    }

    return serializer(type);
}

export function deserializeVariableType(type: VariableTypeName, value: object): VariableType {
    let deserializer = VARIABLE_TYPE_DESERIALIZERS[type];
    if (deserializer === undefined) {
        throw new Error(`Unknown variable type: ${type}`);
    }

    return deserializer(value);
}
