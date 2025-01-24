import {AsyncStore} from "@perfice/stores/store";
import {type Trackable, TrackableCardType} from "@perfice/model/trackable/trackable";
import type {TrackableService} from "@perfice/services/trackable/trackable";
import {writable, type Writable} from "svelte/store";
import {dateToMidnight} from "@perfice/util/time/simple";
import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
import type {EditTrackableCardState, EditTrackableState} from "@perfice/model/trackable/ui";
import {forms, variables} from "@perfice/main";
import {EntityObserverType} from "@perfice/services/observer";
import {VariableTypeName} from "@perfice/model/variable/variable";

export function TrackableDate(): Writable<Date> {
    return writable(dateToMidnight(new Date()));
}

export class TrackableStore extends AsyncStore<Trackable[]> {

    private trackableService: TrackableService;

    constructor(trackableService: TrackableService) {
        super(trackableService.getTrackables());
        this.trackableService = trackableService;
        this.trackableService.addObserver(EntityObserverType.CREATED,
            async (trackable) => await this.onTrackableCreated(trackable));
        this.trackableService.addObserver(EntityObserverType.UPDATED,
            async (trackable) => await this.onTrackableUpdated(trackable));
        this.trackableService.addObserver(EntityObserverType.DELETED,
            async (trackable) => await this.onTrackableDeleted(trackable));
    }

    async createTrackable(trackable: Trackable): Promise<void> {
        await this.trackableService.createTrackable(trackable);
    }

    async updateTrackable(trackable: Trackable): Promise<void> {
        await this.trackableService.updateTrackable(trackable);
    }

    private async onTrackableCreated(trackable: Trackable) {
        this.updateResolved(v => [...v, trackable]);
    }

    private async onTrackableDeleted(trackable: Trackable) {
        this.updateResolved(v => deleteIdentifiedInArray(v, trackable.id));
    }

    private async onTrackableUpdated(trackable: Trackable) {
        this.updateResolved(v => updateIdentifiedInArray(v, trackable));
    }

    async updateTrackableFromState(editState: EditTrackableState) {
        let cardState = editState.cardState;
        editState.trackable.cardType = cardState.cardType;
        switch (cardState.cardType) {
            case TrackableCardType.CHART:
                await this.trackableService.updateTrackableChartSettings(editState.trackable,
                    cardState.cardSettings.aggregateType, cardState.cardSettings.field);
                break;
            case TrackableCardType.VALUE:
                await this.trackableService.updateTrackableValueSettings(editState.trackable, cardState.cardSettings.representation);
                break;
        }

        await this.updateTrackable(editState.trackable);
    }

    async getEditTrackableState(trackable: Trackable): Promise<EditTrackableState | null> {
        let form = await forms.getFormById(trackable.formId);
        if (form == null) return null;

        let cardState: EditTrackableCardState;
        switch (trackable.cardType) {
            case TrackableCardType.CHART:
                let aggregateVariable = await variables.getVariableById(trackable.dependencies["aggregate"]);
                if (aggregateVariable == null) return null;

                let type = aggregateVariable.type;
                if (type.type != VariableTypeName.AGGREGATE) return null;

                let value = type.value;
                cardState = {
                    cardType: TrackableCardType.CHART,
                    cardSettings: {
                        aggregateType: value.getAggregateType(),
                        field: value.getField()
                    }
                };
                break;
            case TrackableCardType.VALUE:
                cardState = {
                    cardType: TrackableCardType.VALUE,
                    cardSettings: {
                        representation: trackable.cardSettings.representation
                    }
                };
                break;
        }

        return {
            trackable,
            form,
            cardState
        }
    }

    async deleteTrackable(trackable: Trackable) {
        await this.trackableService.deleteTrackable(trackable);
    }
}

