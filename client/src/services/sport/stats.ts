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

function unwrapDisplayValue(value: PrimitiveValue): PrimitiveValue {
    if (value.type === PrimitiveValueType.DISPLAY) {
        return (value.value as {value: PrimitiveValue}).value;
    }
    return value;
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
        let weekStartTs = weekStart.getTime();
        let weekEndTs = weekEnd.getTime();

        let weekEntries = sportEntries.filter(
            e => e.timestamp >= weekStartTs && e.timestamp <= weekEndTs
        );

        let sessions = weekEntries.length;
        let totalDurationMs = 0;

        // Build a map of formId -> TIME_ELAPSED question IDs
        let timeElapsedFields = new Map<string, string[]>();
        for (let trackable of sportTrackables) {
            let form = forms.find(f => f.id === trackable.formId);
            if (!form) continue;
            let fields = form.questions
                .filter(q => q.dataType === FormQuestionDataType.TIME_ELAPSED)
                .map(q => q.id);
            if (fields.length > 0) {
                timeElapsedFields.set(trackable.formId, fields);
            }
        }

        // Sum durations from all TIME_ELAPSED fields across all week entries
        for (let entry of weekEntries) {
            let fields = timeElapsedFields.get(entry.formId);
            if (!fields) continue;
            for (let fieldId of fields) {
                let answer = entry.answers[fieldId];
                if (answer == null) continue;
                let unwrapped = unwrapDisplayValue(answer);
                if (unwrapped.type === PrimitiveValueType.NUMBER) {
                    totalDurationMs += unwrapped.value;
                }
            }
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
