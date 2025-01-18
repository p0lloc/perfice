import {VariableTypeName, type VariableType} from "@perfice/model/variable/variable";
import {AggregateVariableType} from "@perfice/services/variable/types/aggregate";
import {ListVariableType} from "@perfice/services/variable/types/list";

export const VARIBALE_TYPE_DESERIALIZERS: Record<string, (value: object) => VariableType> = {
    [VariableTypeName.LIST]: (value: object) => new ListVariableType(),
    [VariableTypeName.AGGREGATE]: (value: object) => new AggregateVariableType()
};

export function deserializeVariableType(type: VariableTypeName, value: object): VariableType {
    let deserializer = VARIBALE_TYPE_DESERIALIZERS[type];
    if (deserializer === undefined) {
        throw new Error(`Unknown variable type: ${type}`);
    }

    return deserializer(value);
}
