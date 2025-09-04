<script lang="ts">
    import {type ComparisonValueResult, formatComparisonNumberValues} from "@perfice/stores/goal/value";
    import CircularProgressBar from "@perfice/components/base/progress/CircularProgressBar.svelte";
    import {getGoalConditionProgress} from "@perfice/model/goal/ui";

    let {value, color}: { value: ComparisonValueResult, color: string } = $props();

    let {first, second, progress, dataType, unit} = $derived(getGoalConditionProgress(value));
</script>

<CircularProgressBar progress={progress} strokeColor={color}>
    {formatComparisonNumberValues(first, second, dataType, unit)}
</CircularProgressBar>
