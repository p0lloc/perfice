<script lang="ts">
    import {
        ForeverTimeScope,
        RangeTimeScope,
        SimpleTimeScope,
        SimpleTimeScopeType,
        type TimeScope, type TimeScopeDefinition,
        TimeScopeType,
        WeekStart
    } from "@perfice/model/variable/time/time";
    import RangedTimeScopePicker from "@perfice/components/base/timeScope/RangedTimeScopePicker.svelte";
    import SimpleTimeScopePicker from "@perfice/components/base/timeScope/SimpleTimeScopePicker.svelte";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import {TIME_SCOPE_TYPES} from "@perfice/model/variable/ui";

    let {value, onChange}: { value: TimeScope, onChange: (v: TimeScope) => void } = $props();

    function onTypeChanged(t: TimeScopeType) {
        let value: TimeScopeDefinition;
        switch (t) {
            case TimeScopeType.SIMPLE:
                value = new SimpleTimeScope(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0);
                break;
            case TimeScopeType.RANGE:
                value = new RangeTimeScope(null, null);
                break;
            case TimeScopeType.FOREVER:
                value = new ForeverTimeScope();
                break;
        }

        // @ts-ignore
        onChange({type: t, value});
    }

    function onSimpleTypeChanged(t: SimpleTimeScopeType){
        onChange({type: TimeScopeType.SIMPLE, value: new SimpleTimeScope(t, WeekStart.MONDAY, 0)});
    }

    function onRangeTypeChanged(t: RangeTimeScope){
        onChange({type: TimeScopeType.RANGE, value: t});
    }
</script>

<div class="row-gap mt-2 flex-wrap md:flex-nowrap">
    <DropdownButton
            class="flex-1 min-w-28"
            value={value.type}
            onChange={onTypeChanged}
            items={TIME_SCOPE_TYPES}/>

    {#if value.type === TimeScopeType.SIMPLE}
        <SimpleTimeScopePicker value={value.value.getType()} onChange={onSimpleTypeChanged}/>
    {:else if value.type === TimeScopeType.RANGE}
        <RangedTimeScopePicker value={value.value} onChange={onRangeTypeChanged}/>
    {/if}
</div>
