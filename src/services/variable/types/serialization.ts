import {VariableTypeName, type VariableType} from "@perfice/model/variable/variable";
import {AggregateVariableType} from "@perfice/services/variable/types/aggregate";
import {ListVariableType} from "@perfice/services/variable/types/list";

export const VARIABLE_TYPE_DESERIALIZERS: Record<string, (value: any) => VariableType> = {
    [VariableTypeName.LIST]: (value: any) => new ListVariableType(
        value.formId,
        value.fields,
    ),
    [VariableTypeName.AGGREGATE]: (value: any) => new AggregateVariableType(
        value.aggregateType,
        value.listVariableId,
    )
};

export const VARIABLE_TYPE_SERIALIZERS: Record<VariableTypeName, (value: VariableType) => object> = {
    [VariableTypeName.LIST]: (value: VariableType) => {
        let listType = value as ListVariableType;
        return {
            formId: listType.getFormId(),
            fields: listType.getFields(),
        }
    },
    [VariableTypeName.AGGREGATE]: (value: VariableType) => {
        let aggregateType = value as AggregateVariableType;
        return {
            aggregateType: aggregateType.getAggregateType(),
            listVariableId: aggregateType.getListVariableId(),
        };
    }
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
