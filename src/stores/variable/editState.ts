import type {FormService} from "@perfice/services/form/form";
import type {TrackableService} from "@perfice/services/trackable/trackable";
import {type Variable, VariableTypeName} from "@perfice/model/variable/variable";
import {AggregateVariableType} from "@perfice/services/variable/types/aggregate";
import {VariableEditProvider} from "@perfice/stores/variable/edit";
import type {ListVariableType} from "@perfice/services/variable/types/list";
import type {Form} from "@perfice/model/form/form";
import type {Trackable} from "@perfice/model/trackable/trackable";
import type {LatestVariableType} from "@perfice/services/variable/types/latest";

export interface EditAggregationVariableState {
    listVariable: Variable;
    listVariableValue: ListVariableType;
    forms: Form[];
    entities: Trackable[];
}

export interface EditLatestVariableState {
    forms: Form[];
    entities: Trackable[];
}

export class VariableEditStateProvider {
    private readonly editProvider: VariableEditProvider;
    private readonly formService: FormService;
    private readonly trackableService: TrackableService;

    constructor(editProvider: VariableEditProvider, formService: FormService, trackableService: TrackableService) {
        this.editProvider = editProvider;
        this.formService = formService;
        this.trackableService = trackableService;
    }

    async getEditState(variable: Variable): Promise<any> {
        switch (variable.type.type) {
            case VariableTypeName.AGGREGATE:
                return this.getEditStateForAggregateVariable(variable.type.value);
            case VariableTypeName.LATEST:
                return this.getEditStateForLatestVariable(variable.type.value);
            case VariableTypeName.CALCULATION:
                return {};
        }

        return null;
    }


    private async getEditStateForLatestVariable(value: LatestVariableType): Promise<EditLatestVariableState | null> {
        let forms = await this.formService.getForms();
        let entities = await this.trackableService.getTrackables();

        return {
            forms,
            entities
        }
    }

    private async getEditStateForAggregateVariable(value: AggregateVariableType): Promise<EditAggregationVariableState | null> {
        let listVariable = this.editProvider.getVariableById(value.getListVariableId());
        if (listVariable == null) return null;

        if (listVariable.type.type != VariableTypeName.LIST) return null;

        let forms = await this.formService.getForms();
        let entities = await this.trackableService.getTrackables();

        return {
            listVariable,
            listVariableValue: listVariable.type.value,
            forms,
            entities
        }
    }
}
