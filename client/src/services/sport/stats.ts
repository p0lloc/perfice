import type {JournalEntry} from "@perfice/model/journal/journal";
import type {RestDay} from "@perfice/model/sport/restday";
import type {Trackable} from "@perfice/model/trackable/trackable";
import type {Form} from "@perfice/model/form/form";
import {FormQuestionDataType} from "@perfice/model/form/form";
import {PrimitiveValueType} from "@perfice/model/primitive/primitive";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
import {SportStreakService} from "@perfice/services/sport/streak";

export interface SportWeekStats {
    sessions: number;
    totalDurationMs: number;
    streak: number;
}

export function unwrapDisplayValue(value: PrimitiveValue): PrimitiveValue {
    if (value.type === PrimitiveValueType.DISPLAY) {
        return value.value.value;
    }
    return value;
}

/** Build a map of formId -> TIME_ELAPSED question IDs for duration extraction */
export function buildTimeElapsedFieldsMap(trackables: Trackable[], forms: Form[]): Map<string, string[]> {
    let formMap = new Map(forms.map(f => [f.id, f]));
    let fields = new Map<string, string[]>();
    for (let trackable of trackables) {
        let form = formMap.get(trackable.formId);
        if (!form) continue;
        let qids = form.questions
            .filter(q => q.dataType === FormQuestionDataType.TIME_ELAPSED)
            .map(q => q.id);
        if (qids.length > 0) fields.set(trackable.formId, qids);
    }
    return fields;
}

/** Format a duration in milliseconds to "Xh Ym" string */
export function formatDurationMs(ms: number): string {
    let totalMinutes = Math.floor(ms / 60000);
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
}

/** Get the total duration in ms for a single journal entry */
export function getEntryDurationMs(entry: JournalEntry, timeElapsedFields: Map<string, string[]>): number {
    let fields = timeElapsedFields.get(entry.formId);
    if (!fields) return 0;
    let total = 0;
    for (let fieldId of fields) {
        let answer = entry.answers[fieldId];
        if (answer == null) continue;
        let unwrapped = unwrapDisplayValue(answer);
        if (unwrapped.type === PrimitiveValueType.NUMBER) {
            total += unwrapped.value;
        }
    }
    return total;
}

export class SportStatsService {

    private streakService: SportStreakService;

    constructor(streakService: SportStreakService) {
        this.streakService = streakService;
    }

    computeWeekStats(
        sportEntries: JournalEntry[],
        sportTrackables: Trackable[],
        forms: Form[],
        restDays: RestDay[],
        weekStart: Date,
        weekEnd: Date,
        today: Date
    ): SportWeekStats {
        // Entries are expected to be pre-filtered to the week range by the caller.
        // We trust that contract instead of re-filtering.
        let sessions = sportEntries.length;

        let timeElapsedFields = buildTimeElapsedFieldsMap(sportTrackables, forms);
        let totalDurationMs = 0;
        for (let entry of sportEntries) {
            totalDurationMs += getEntryDurationMs(entry, timeElapsedFields);
        }

        // Streak is calculated globally (not scoped to week)
        let streak = this.streakService.calculateStreak(sportEntries, restDays, today);

        return {sessions, totalDurationMs, streak};
    }

    formatDuration(ms: number): string {
        let totalMinutes = Math.floor(ms / 60000);
        let hours = Math.floor(totalMinutes / 60);
        let minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
    }
}
