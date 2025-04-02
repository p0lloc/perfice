<script lang="ts">
    import type {DateSearch} from "@perfice/model/journal/search/date";
    import TimeScopePicker from "@perfice/components/base/timeScope/TimeScopePicker.svelte";
    import RangedTimeScopePicker from "@perfice/components/base/timeScope/RangedTimeScopePicker.svelte";
    import {timeRangeToRangedTimeScope} from "@perfice/model/variable/time/time";

    let {options, onChange}: { options: DateSearch, onChange: (options: DateSearch) => void } = $props();
</script>

<div class="p-4">
    <RangedTimeScopePicker value={timeRangeToRangedTimeScope(options.range)}
                           onChange={v => onChange({...options, range: v.convertToRange()})}/>
</div>