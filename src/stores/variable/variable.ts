import {AsyncStore} from "@perfice/stores/store";
import type {VariableService} from "@perfice/services/variable/variable";
import type {Variable} from "@perfice/model/variable/variable";
import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
import { EntityObserverType } from "@perfice/services/observer";

export class VariableStore extends AsyncStore<Variable[]> {

    private variableService: VariableService;

    constructor(variableService: VariableService) {
        super(variableService.loadVariables());
        this.variableService = variableService;
        variableService.addObserver(EntityObserverType.CREATED, async (v) => await this.onVariableCreated(v));
        variableService.addObserver(EntityObserverType.DELETED, async (v) => await this.onVariableDeleted(v));
        variableService.addObserver(EntityObserverType.UPDATED, async (v) => await this.onVariableUpdated(v));
    }

    public async getVariableById(id: string): Promise<Variable | undefined> {
        let variables = await this.get();
        return variables.find(v => v.id == id);
    }

    private async onVariableCreated(variable: Variable) {
        this.updateResolved(v => [...v, variable]);
    }

    private async onVariableDeleted(variable: Variable) {
        this.updateResolved(v => deleteIdentifiedInArray(v, variable.id));
    }

    private async onVariableUpdated(variable: Variable) {
        this.updateResolved(v => updateIdentifiedInArray(v, variable));
    }

}
