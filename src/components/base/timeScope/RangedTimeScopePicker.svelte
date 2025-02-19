<script lang="ts">
    import {formatDateYYYYMMDD} from "@perfice/util/time/format";
    import {RangeTimeScope} from "@perfice/model/variable/time/time";
    import Button from "@perfice/components/base/button/Button.svelte";
    import RangedDatePicker from "@perfice/components/base/timeScope/RangedDatePicker.svelte";

    let {value, onChange}: { value: RangeTimeScope, onChange: (v: RangeTimeScope) => void } = $props();
    let start = $derived(value.getStart());
    let end = $derived(value.getEnd());

    function onFromChange(v: number | null) {
        onChange(new RangeTimeScope(v, end));
    }

    function onToChange(v: number | null) {
        onChange(new RangeTimeScope(start, v));
    }
</script>

<div class="row-gap flex-wrap w-full">
    <RangedDatePicker name="from" value={start} onChange={onFromChange}/>
    <RangedDatePicker name="to" value={end} onChange={onToChange}/>
</div>
