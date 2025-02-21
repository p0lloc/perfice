import {AsyncStore} from "@perfice/stores/store";
import {type Trackable, TrackableCardType, type TrackableCategory} from "@perfice/model/trackable/trackable";
import type {TrackableService} from "@perfice/services/trackable/trackable";
import {writable, type Writable} from "svelte/store";
import {dateToMidnight, dateWithCurrentTime} from "@perfice/util/time/simple";
import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
import type {EditTrackableCardState, EditTrackableState} from "@perfice/model/trackable/ui";
import {forms, journal, trackableCategories, variables} from "@perfice/main";
import {EntityObserverType} from "@perfice/services/observer";
import {VariableTypeName} from "@perfice/model/variable/variable";
import {type JournalEntryValue, pDisplay, pNumber, PrimitiveValueType} from "@perfice/model/primitive/primitive";
import {extractValueFromDisplay} from "@perfice/services/variable/types/list";

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

    async createTrackable(name: string, categoryId: string | null = null): Promise<void> {
        await this.trackableService.createTrackable(name, categoryId);
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
                    cardState.cardSettings.aggregateType, cardState.cardSettings.field, cardState.cardSettings.color);
                break;
            case TrackableCardType.VALUE:
                await this.trackableService.updateTrackableValueSettings(editState.trackable, cardState.cardSettings);
                break;
            case TrackableCardType.TALLY:
                await this.trackableService.updateTrackableTallySettings(editState.trackable, cardState.cardSettings);
                break;
        }

        await this.updateTrackable(editState.trackable);
    }

    async getEditTrackableState(rawTrackable: Trackable): Promise<EditTrackableState | null> {
        let trackable = structuredClone(rawTrackable);
        let form = await forms.getFormById(trackable.formId);
        if (form == null) return null;

        let categories = await trackableCategories.get();

        let cardState: EditTrackableCardState;
        switch (trackable.cardType) {
            case TrackableCardType.CHART: {
                let aggregateVariable = await variables.getVariableById(trackable.dependencies["aggregate"]);
                if (aggregateVariable == null) return null;

                let type = aggregateVariable.type;
                if (type.type != VariableTypeName.AGGREGATE) return null;

                let value = type.value;
                cardState = {
                    cardType: TrackableCardType.CHART,
                    cardSettings: {
                        aggregateType: value.getAggregateType(),
                        field: value.getField(),
                        color: trackable.cardSettings.color
                    }
                };
                break;
            }
            case TrackableCardType.VALUE: {
                cardState = {
                    cardType: TrackableCardType.VALUE,
                    cardSettings: {
                        representation: trackable.cardSettings.representation,
                        type: trackable.cardSettings.type,
                        settings: trackable.cardSettings.settings
                    }
                };
                break;
            }
            case TrackableCardType.TALLY: {

                let listVariable = await variables.getVariableById(trackable.dependencies["value"]);
                if (listVariable == null) return null;

                let type = listVariable.type;
                if (type.type != VariableTypeName.LIST) return null;

                let fieldIds = Object.keys(type.value.getFields());
                if (fieldIds.length != 1) return null;

                cardState = {
                    cardType: TrackableCardType.TALLY,
                    cardSettings: {
                        questionId: fieldIds[0]
                    }
                };
                break;
            }
        }

        return {
            trackable,
            categories,
            form,
            cardState
        }
    }

    private async getTallyTrackableQuestion(trackable: Trackable): Promise<string | null> {
        let listVariable = await variables.getVariableById(trackable.dependencies["value"]);
        if (listVariable == null) return null;

        let type = listVariable.type;
        if (type.type != VariableTypeName.LIST) return null;

        let fieldIds = Object.keys(type.value.getFields());
        if (fieldIds.length != 1) return null;

        return fieldIds[0];
    }

    async deleteTrackable(trackable: Trackable) {
        await this.trackableService.deleteTrackable(trackable);
    }

    async reorderTrackables(category: TrackableCategory | null, items: Trackable[]) {
        await this.trackableService.reorderTrackables(category, items);

        let current = await this.get();
        items.forEach((t) => current = updateIdentifiedInArray(current, t));
        this.setResolved(current);
    }

    async logTally(trackable: Trackable, entryValue: null | JournalEntryValue, increment: boolean, date: Date) {
        let form = await forms.getFormById(trackable.formId);
        if (form == null) return;

        let questionId = await this.getTallyTrackableQuestion(trackable);
        if (questionId == null) return;

        let timestamp = dateWithCurrentTime(date).getTime();

        if (entryValue == null) {
            let value = pNumber(increment ? 1 : -1);
            await journal.logEntry(form, {
                [questionId]: pDisplay(value, value)
            }, timestamp);
        } else {
            let entry = await journal.getEntryById(entryValue.id);
            if(entry == null) return;

            let answers = entry.answers;
            let answer = answers[questionId];
            if(answer == null) return;

            let previousValue = extractValueFromDisplay(answer);
            if(previousValue.type != PrimitiveValueType.NUMBER) return;

            let value = pNumber(previousValue.value + (increment ? 1 : -1));
            answers[questionId] = pDisplay(value, value);
            await journal.updateEntry({
                ...entry,
                answers,
                timestamp
            }, form.format);
        }
    }
}

