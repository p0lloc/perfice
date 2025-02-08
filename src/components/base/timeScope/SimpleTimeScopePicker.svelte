<script lang="ts">
    import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import {SIMPLE_TIME_SCOPE_TYPES} from "@perfice/model/variable/ui";

    let {value, onChange}: { value: SimpleTimeScopeType, onChange: (v: SimpleTimeScopeType) => void } = $props();
</script>

<DropdownButton
        {value}
        {onChange}
        items={SIMPLE_TIME_SCOPE_TYPES}/>
