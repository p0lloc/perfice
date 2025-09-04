<script lang="ts">
    import type {DateSearch} from "@perfice/model/journal/search/date";
    import RangedTimeScopePicker from "@perfice/components/base/timeScope/RangedTimeScopePicker.svelte";
    import {timeRangeToRangedTimeScope, TimeRangeType} from "@perfice/model/variable/time/time";

    let {options, onChange}: { options: DateSearch, onChange: (options: DateSearch) => void } = $props();

    let ranged = $derived(timeRangeToRangedTimeScope(options.range));
    let converted = $derived(ranged.convertToRange());
</script>

<div class="p-4">
    {#if converted.type !== TimeRangeType.ALL && ranged.getStart() === ranged.getEnd()}
        <span class="text-red-500">
            Empty date range, to select a single date, set "To" as the next day.
        </span>
    {/if}
    <RangedTimeScopePicker value={ranged}
                           onChange={v => onChange({...options, range: v.convertToRange()})}/>
</div>