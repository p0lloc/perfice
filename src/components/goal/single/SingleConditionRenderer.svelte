<script lang="ts">
    import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import CircularProgressBar from "@perfice/components/base/progress/CircularProgressBar.svelte";
    import {getGoalConditionProgress} from "@perfice/model/goal/ui";

    let {value, color}: { value: PrimitiveValue, color: string } = $props();

    let {first, second, progress} = $derived(getGoalConditionProgress(value));
</script>

<CircularProgressBar {progress} strokeColor={color}>
    {first} of {second}
</CircularProgressBar>
