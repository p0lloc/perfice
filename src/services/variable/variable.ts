import type {VariableCollection} from "@perfice/db/collections";
import {
    type StoredVariable,
    type Variable,
    type VariableTypeDef,
} from "@perfice/model/variable/variable";
import {deserializeVariableType, serializeVariableType} from "@perfice/services/variable/types/serialization";

export class VariableService {

    private variableCollection: VariableCollection;

    constructor(variableCollection: VariableCollection) {
        this.variableCollection = variableCollection;
    }

    async getVariables(): Promise<Variable[]> {
        let stored = await this.variableCollection.getVariables();
        return stored.map(this.deserializeVariable);
    }

    async createVariable(variable: Variable): Promise<void> {
        let stored = this.serializeVariable(variable);
        return this.variableCollection.createVariable(stored);
    }

    async getVariableById(id: string): Promise<Variable | undefined> {
        let variable = await this.variableCollection.getVariableById(id);
        if (variable === undefined) {
            return undefined;
        }

        return this.deserializeVariable(variable);
    }

    private serializeVariable(variable: Variable): StoredVariable {
        return {
            ...variable,
            type: {
                type: variable.type.type,
                value: serializeVariableType(variable.type.value)
            }
        }
    }

    private deserializeVariable(stored: StoredVariable): Variable {
        return {
            ...stored,
            type: {
                type: stored.type.type,
                value: deserializeVariableType(stored.type.type, stored.type.value)
            } as VariableTypeDef
        }
    }

}
