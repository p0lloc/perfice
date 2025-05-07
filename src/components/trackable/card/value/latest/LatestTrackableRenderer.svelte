<script lang="ts">
    import {type JournalEntryValue, type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
    import type {LatestTrackableValueSettings, TrackableValueSettings} from "@perfice/model/trackable/trackable";
    import {formatAnswersIntoRepresentation} from "@perfice/model/trackable/ui";
    import {formatDateLongTermOrHHMM} from "@perfice/util/time/format";
    import {weekStart} from "@perfice/stores";

    let {values, cardSettings, date}: {
        values: PrimitiveValue[],
        cardSettings: TrackableValueSettings,
        valueSettings: LatestTrackableValueSettings,
        date: Date
    } = $props();

    let entry: JournalEntryValue | null = $derived.by(() => {
        if (values.length < 1) return null;

        let last = values[values.length - 1];
        if (last.type != PrimitiveValueType.JOURNAL_ENTRY) return null;

        return last.value as JournalEntryValue;
    });
</script>

<div class="flex flex-col items-center">
    {#if entry != null}
        <span>
            {formatAnswersIntoRepresentation(entry.value, cardSettings.representation)}
        </span>
        <span class="text-xs">
            {formatDateLongTermOrHHMM(new Date(entry.timestamp), date, $weekStart)}
        </span>
    {:else}
        No values
    {/if}
</div>
