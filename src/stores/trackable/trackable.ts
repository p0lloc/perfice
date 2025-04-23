import {AsyncStore} from "@perfice/stores/store";
import {type Trackable, TrackableCardType, type TrackableCategory} from "@perfice/model/trackable/trackable";
import type {TrackableService} from "@perfice/services/trackable/trackable";
import {writable, type Writable} from "svelte/store";
import {dateToMidnight, dateWithCurrentTime} from "@perfice/util/time/simple";
import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
import type {EditTrackableState} from "@perfice/model/trackable/ui";
import {EntityObserverType} from "@perfice/services/observer";
import {type JournalEntryValue, pDisplay, pNumber, PrimitiveValueType} from "@perfice/model/primitive/primitive";
import {extractValueFromDisplay} from "@perfice/services/variable/types/list";
import {resolvedPromise} from "@perfice/util/promise";
import type {TrackableSuggestion} from "@perfice/model/trackable/suggestions";
import type {Form, FormQuestionDataType} from "@perfice/model/form/form";
import {forms, journal, trackableCategories} from "@perfice/stores";

export function TrackableDate(): Writable<Date> {
    return writable(dateToMidnight(new Date()));
}

export class TrackableStore extends AsyncStore<Trackable[]> {

    private trackableService: TrackableService;

    constructor(trackableService: TrackableService) {
        super(resolvedPromise([]))
        this.trackableService = trackableService;
        this.trackableService.addObserver(EntityObserverType.CREATED,
            async (trackable) => await this.onTrackableCreated(trackable));
        this.trackableService.addObserver(EntityObserverType.UPDATED,
            async (trackable) => await this.onTrackableUpdated(trackable));
        this.trackableService.addObserver(EntityObserverType.DELETED,
            async (trackable) => await this.onTrackableDeleted(trackable));
    }

    load() {
        this.set(this.trackableService.getTrackables());
    }

    async createTrackableFromSuggestion(suggestion: TrackableSuggestion, categoryId: string | null) {
        await this.trackableService.createTrackableFromSuggestion(suggestion, categoryId);
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
        await this.updateTrackable(editState.trackable);
    }

    async onTrackableFromFormCreated(form: Form, categoryId: string | null) {
        await this.trackableService.createTrackableFromForm(form, categoryId);
    }

    async getEditTrackableState(rawTrackable: Trackable): Promise<EditTrackableState | null> {
        let trackable = structuredClone(rawTrackable);
        let form = await forms.getFormById(trackable.formId);
        if (form == null) return null;

        let categories = await trackableCategories.get();

        /*
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
        }*/

        return {
            trackable,
            categories,
            form,
        }
    }

    private async getTallyTrackableQuestion(trackable: Trackable): Promise<string | null> {
        if (trackable.cardType != TrackableCardType.TALLY) return null;

        return trackable.cardSettings.field;
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
            }, form.format, timestamp);
        } else {
            let entry = await journal.getEntryById(entryValue.id);
            if (entry == null) return;

            let answers = entry.answers;
            let answer = answers[questionId];
            if (answer == null) return;

            let previousValue = extractValueFromDisplay(answer);
            if (previousValue.type != PrimitiveValueType.NUMBER) return;

            let value = pNumber(previousValue.value + (increment ? 1 : -1));
            answers[questionId] = pDisplay(value, value);
            await journal.updateEntry({
                ...entry,
                answers,
                timestamp
            }, form.format);
        }
    }

    async fetchTrackables() {
        return await this.trackableService.getTrackables();
    }

    async getTrackableById(trackableId: string, fetch: boolean): Promise<Trackable | null> {
        let trackables = await this.get();
        let cached = trackables.find(f => f.id == trackableId);
        if (cached != null) return cached;

        if (!fetch) return null;

        let trackable = await this.trackableService.getTrackableById(trackableId);
        if (trackable == null) return null;

        this.updateResolved(v => [...v, trackable]);
        return trackable;
    }

    async createSingleValueTrackable({categoryId, name, icon, type}: {
        categoryId: string | null,
        name: string,
        icon: string,
        type: FormQuestionDataType
    }) {
        await this.trackableService.createSingleValueTrackable(categoryId, name, icon, type);
    }
}

