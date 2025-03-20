import {type Variable, VariableTypeName} from "@perfice/model/variable/variable";
import type {FormService} from "@perfice/services/form/form";
import type {VariableService} from "@perfice/services/variable/variable";
import type {TrackableService} from "@perfice/services/trackable/trackable";
import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
import {ListVariableType} from "@perfice/services/variable/types/list";
import {AggregateType, AggregateVariableType} from "@perfice/services/variable/types/aggregate";
import {type ConstantOrVariable, GoalVariableType} from "@perfice/services/variable/types/goal";
import {SimpleTimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";

import {VariableEditStateProvider} from "@perfice/stores/variable/editState";

import {CalculationOperator, CalculationVariableType} from "@perfice/services/variable/types/calculation";
import {pNull, prettyPrintPrimitive, PrimitiveValueType} from "@perfice/model/primitive/primitive";
import {TagVariableType} from "@perfice/services/variable/types/tag";
import {LatestVariableType} from "@perfice/services/variable/types/latest";

export enum VariableChangeType {
    CREATE,
    UPDATE,
    DELETE,
}

export interface VariableChange {
    id: string;
    type: VariableChangeType;
    data: Variable | null;
}


/**
 * Provides a context for editing variables, changes are stored in memory and only saved to
 * the database when "save" is called.
 *
 * Also provides concrete edit states where variables/forms/entities are fetched
 * so that they can be readily used in the UI.
 */
export class VariableEditProvider {

    private readonly variableService: VariableService;

    private changes: VariableChange[] = [];
    private variables: Variable[] = [];

    private autoSave: boolean = false;

    private readonly editStateProvider: VariableEditStateProvider;

    constructor(variableService: VariableService, formService: FormService, trackableService: TrackableService) {
        this.variableService = variableService;
        this.editStateProvider = new VariableEditStateProvider(this, formService, trackableService);
    }

    /**
     * Starts a new edit by fetching all available variables.
     * Discards any previous changes.
     */
    newEdit(autoSave: boolean = false) {
        this.variables = this.variableService.getVariables();
        this.changes = [];
        this.autoSave = autoSave;
    }

    getVariableById(id: string): Variable | undefined {
        return this.variables.find(v => v.id == id);
    }

    textForConstantOrVariable(v: ConstantOrVariable): string {
        if (v.constant || v.value.type != PrimitiveValueType.STRING) {
            return prettyPrintPrimitive(v.value);
        }

        let variable = this.getVariableById(v.value.value);
        if (variable == null) return "Unknown source";

        return variable.name;
    }

    async getEditState(variable: Variable): Promise<any> {
        return this.editStateProvider.getEditState(variable);
    }

    private createVariablesFromType(type: VariableTypeName): { variable: Variable, dependents?: Variable[] } {
        switch (type) {
            case VariableTypeName.LIST:
                return {
                    variable: {
                        id: crypto.randomUUID(),
                        name: "List",
                        type: {
                            type: VariableTypeName.LIST,
                            value: new ListVariableType("", {}, [])
                        }
                    }
                };
            case VariableTypeName.TAG:
                return {
                    variable: {
                        id: crypto.randomUUID(),
                        name: "Tag",
                        type: {
                            type: VariableTypeName.TAG,
                            value: new TagVariableType("")
                        }
                    }
                };
            case VariableTypeName.LATEST:
                return {
                    variable: {
                        id: crypto.randomUUID(),
                        name: "Tag",
                        type: {
                            type: VariableTypeName.LATEST,
                            value: new LatestVariableType("", {}, [])
                        }
                    }
                };
            case VariableTypeName.AGGREGATE:
                let listVariable: Variable = this.createVariablesFromType(VariableTypeName.LIST).variable;
                let aggregateVariable: Variable = {
                    id: crypto.randomUUID(),
                    name: "Aggregate",
                    type: {
                        type: VariableTypeName.AGGREGATE,
                        value: new AggregateVariableType(AggregateType.SUM, listVariable.id, "")
                    }
                }

                return {variable: aggregateVariable, dependents: [listVariable]};
            case VariableTypeName.GOAL:
                return {
                    variable: {
                        id: crypto.randomUUID(),
                        name: "Goal",
                        type: {
                            type: VariableTypeName.GOAL,
                            value: new GoalVariableType([], tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0))
                        }
                    },
                };
            case VariableTypeName.CALCULATION:
                return {
                    variable: {
                        id: crypto.randomUUID(),
                        name: "Calculation",
                        type: {
                            type: VariableTypeName.CALCULATION,
                            value: new CalculationVariableType([
                                {constant: true, value: pNull()},
                                CalculationOperator.PLUS,
                                {constant: true, value: pNull()}
                            ])
                        }
                    },
                };
        }
    }

    createVariable(variable: Variable) {
        this.addChange({id: variable.id, type: VariableChangeType.CREATE, data: variable});
    }

    createVariableFromType(variableType: VariableTypeName): Variable {
        let {variable, dependents} = this.createVariablesFromType(variableType);

        this.createVariable(variable);
        dependents?.forEach(v => this.createVariable(v));

        this.variables = this.variables.concat(dependents != null ? [...dependents, variable] : [variable]);
        return variable;
    }

    updateVariable(variable: Variable) {
        // Delete any previous updates as they are now obsolete
        this.changes = this.changes.filter(c => c.id != variable.id || c.type != VariableChangeType.UPDATE);

        this.addChange({id: variable.id, type: VariableChangeType.UPDATE, data: variable});
        this.variables = updateIdentifiedInArray(this.variables, variable);
    }

    /**
     * Deletes a variable and recursively all of the dependencies returned by the type.
     */
    deleteVariableAndDependencies(id: string) {
        let variable = this.getVariableById(id);
        if (variable == null) return;

        this.addChange({id, type: VariableChangeType.DELETE, data: null});
        this.variables = deleteIdentifiedInArray(this.variables, id);

        for (let dependencyId of variable.type.value.getDependencies()) {
            this.deleteVariableAndDependencies(dependencyId);
        }
    }

    private addChange(change: VariableChange) {
        this.changes.push(change);
        if (this.autoSave) {
            this.save();
        }
    }

    /**
     * Saves all changes to database.
     */
    async save() {
        for (let change of this.changes) {
            switch (change.type) {
                case VariableChangeType.CREATE:
                    if (change.data == null) continue;
                    await this.variableService.createVariable(change.data);
                    break;
                case VariableChangeType.UPDATE:
                    if (change.data == null) continue;
                    await this.variableService.updateVariable(change.data);
                    break;
                case VariableChangeType.DELETE:
                    await this.variableService.deleteVariableById(change.id);
                    break;
            }
        }

        this.changes = [];
    }

    getVariables(): Variable[] {
        return this.variables;
    }

}
