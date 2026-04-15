<script lang="ts">
    import type {JournalEntry} from "@perfice/model/journal/journal";
    import type {Trackable} from "@perfice/model/trackable/trackable";
    import type {RestDay} from "@perfice/model/sport/restday";
    import type {Form} from "@perfice/model/form/form";
    import {WEEK_DAYS_SHORT, MONTHS_SHORT, formatDateYYYYMMDD} from "@perfice/util/time/format";
    import {buildTimeElapsedFieldsMap, getEntryDurationMs, formatDurationMs} from "@perfice/services/sport/stats";
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
    let timeElapsedFields = $derived(buildTimeElapsedFieldsMap(trackables, forms));

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
                            durationFormatted={formatDurationMs(getEntryDurationMs(entry, timeElapsedFields))}
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
