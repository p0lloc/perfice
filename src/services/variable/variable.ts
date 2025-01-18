import type {VariableCollection} from "@perfice/db/collections";
import {
    type StoredVariable,
    type Variable,
    type VariableTypeDef,
} from "@perfice/model/variable/variable";
import {deserializeVariableType, serializeVariableType} from "@perfice/services/variable/types/serialization";
import type {VariableGraph} from "@perfice/services/variable/graph";
import type {TimeScope} from "@perfice/model/variable/time/time";
import {pNull, type PrimitiveValue} from "@perfice/model/primitive/primitive";
import type {JournalEntry} from "@perfice/model/journal/journal";

export class VariableService {

    private variableCollection: VariableCollection;
    private graph: VariableGraph;

    constructor(variableCollection: VariableCollection, variableGraph: VariableGraph) {
        this.variableCollection = variableCollection;
        this.graph = variableGraph;
    }

    async loadVariables(): Promise<void> {
        let stored = await this.variableCollection.getVariables();
        let variables = stored.map(this.deserializeVariable);

        this.graph.loadVariables(variables);
    }

    getVariables(): Variable[] {
        return this.graph.getVariables();
    }

    async evaluateVariable(id: string, timeScope: TimeScope): Promise<PrimitiveValue>{
        let variable = this.getVariableById(id)
        if(variable == null){
            return pNull();
        }

        return this.graph.evaluateVariable(variable, timeScope, false, []);
    }

    async createVariable(variable: Variable): Promise<void> {
        let stored = this.serializeVariable(variable);
        await this.variableCollection.createVariable(stored);
        this.graph.onVariableCreated(variable);
    }

    getVariableById(id: string): Variable | undefined {
        return this.graph.getVariableById(id);
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

    async onEntryCreated(e: JournalEntry) {
        await this.graph.onEntryCreated(e);
    }
}
