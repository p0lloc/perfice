<script lang="ts">
    import type {JournalEntry} from "@perfice/model/journal/journal";
    import type {Trackable} from "@perfice/model/trackable/trackable";
    import type {RestDay} from "@perfice/model/sport/restday";
    import type {Form} from "@perfice/model/form/form";
    import {FormQuestionDataType} from "@perfice/model/form/form";
    import {PrimitiveValueType} from "@perfice/model/primitive/primitive";
    import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
    import {WEEK_DAYS_SHORT, MONTHS_SHORT, formatDateYYYYMMDD} from "@perfice/util/time/format";
    import SportActivityRow from "./SportActivityRow.svelte";
    import RestDayToggle from "./RestDayToggle.svelte";

    let {entries, trackables, forms, restDays, weekStart, weekEnd, onToggleRestDay}: {
        entries: JournalEntry[];
        trackables: Trackable[];
        forms: Form[];
        restDays: RestDay[];
        weekStart: Date;
        weekEnd: Date;
        onToggleRestDay: (dateStr: string) => void;
    } = $props();

    interface DayGroup {
        date: Date;
        dateStr: string;
        label: string;
        entries: JournalEntry[];
        isRestDay: boolean;
    }

    let trackableMap = $derived(new Map(trackables.map(t => [t.formId, t])));
    let restDaySet = $derived(new Set(restDays.map(r => r.date)));

    // Build a map of formId -> TIME_ELAPSED question IDs for duration extraction
    let timeElapsedFields = $derived.by(() => {
        let fields = new Map<string, string[]>();
        for (let trackable of trackables) {
            let form = forms.find(f => f.id === trackable.formId);
            if (!form) continue;
            let qids = form.questions
                .filter(q => q.dataType === FormQuestionDataType.TIME_ELAPSED)
                .map(q => q.id);
            if (qids.length > 0) fields.set(trackable.formId, qids);
        }
        return fields;
    });

    function getEntryDurationMs(entry: JournalEntry): number {
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

    function unwrapDisplayValue(value: PrimitiveValue): PrimitiveValue {
        if (value.type === PrimitiveValueType.DISPLAY) {
            return value.value.value;
        }
        return value;
    }

    function formatDurationMs(ms: number): string {
        let totalMinutes = Math.floor(ms / 60000);
        let hours = Math.floor(totalMinutes / 60);
        let minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
    }

    function formatDayLabel(date: Date): string {
        let dayName = WEEK_DAYS_SHORT[date.getDay()];
        let monthName = MONTHS_SHORT[date.getMonth()];
        return `${dayName}, ${monthName} ${date.getDate()}`;
    }

    let dayGroups: DayGroup[] = $derived.by(() => {
        let groups: DayGroup[] = [];
        let current = new Date(weekStart);

        while (current <= weekEnd) {
            let dateStr = formatDateYYYYMMDD(current);
            let dayStart = new Date(current);
            dayStart.setHours(0, 0, 0, 0);
            let dayEnd = new Date(current);
            dayEnd.setHours(23, 59, 59, 999);

            let dayEntries = entries.filter(e =>
                e.timestamp >= dayStart.getTime() && e.timestamp <= dayEnd.getTime()
            );

            groups.push({
                date: new Date(current),
                dateStr,
                label: formatDayLabel(current),
                entries: dayEntries.sort((a, b) => b.timestamp - a.timestamp),
                isRestDay: restDaySet.has(dateStr),
            });

            current.setDate(current.getDate() + 1);
        }

        return groups.reverse();
    });
</script>

<div class="flex flex-col gap-3">
    {#each dayGroups as day (day.dateStr)}
        <div class="rounded-xl bg-white dark:bg-gray-800 default-border overflow-hidden">
            <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {day.label}
                </span>
                <RestDayToggle isRestDay={day.isRestDay} onToggle={() => onToggleRestDay(day.dateStr)}/>
            </div>

            {#if day.entries.length > 0}
                <div class="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {#each day.entries as entry (entry.id)}
                        <SportActivityRow
                            {entry}
                            trackable={trackableMap.get(entry.formId)}
                            durationFormatted={formatDurationMs(getEntryDurationMs(entry))}
                        />
                    {/each}
                </div>
            {:else if !day.isRestDay}
                <div class="py-3 text-center text-xs text-gray-400 dark:text-gray-500">
                    No activities
                </div>
            {:else}
                <div class="py-3 text-center text-xs text-blue-400 dark:text-blue-500">
                    Rest day
                </div>
            {/if}
        </div>
    {/each}
</div>
