import type {VariableCollection} from "@perfice/db/collections";
import {type StoredVariable, type Variable, VariableTypeName} from "@perfice/model/variable/variable";
import {deserializeVariableType} from "@perfice/services/variable/types/deserializer";

export class VariableService {

    private variableCollection: VariableCollection;

    constructor(variableCollection: VariableCollection) {
        this.variableCollection = variableCollection;
    }

    async getVariables(): Promise<Variable[]> {
        let stored = await this.variableCollection.getVariables();
        return stored.map(this.deserializeVariable);
    }

    async getVariableById(id: string): Promise<Variable | undefined> {
        let variable = await this.variableCollection.getVariableById(id);
        if (variable === undefined) {
            return undefined;
        }

        return this.deserializeVariable(variable);
    }

    private deserializeVariable(stored: StoredVariable): Variable {
        return {
            ...stored,
            type: {
                type: VariableTypeName.LIST,
                value: deserializeVariableType(stored.type.type, stored.type.value)
            }
        }
    }

}
