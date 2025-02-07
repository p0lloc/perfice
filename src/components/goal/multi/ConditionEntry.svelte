<script lang="ts">
    import {type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
    import {getGoalConditionProgress} from "@perfice/model/goal/ui";
    import CircularProgressBar from "@perfice/components/base/progress/CircularProgressBar.svelte";
    import GoalMetIndicator from "@perfice/components/goal/GoalMetIndicator.svelte";

    let {value, color}: { value: PrimitiveValue, color: string } = $props();

    let {first, second, progress} = $derived(getGoalConditionProgress(value));
</script>

<div class="row-between p-2 gap-2 w-full border-b">
    {#if value.type === PrimitiveValueType.COMPARISON_RESULT}
        <CircularProgressBar width={30} height={30} strokeWidth={60} {progress}
                             strokeColor={color}></CircularProgressBar>
    {:else}
        <GoalMetIndicator {value}/>
    {/if}
    <div>
        {first} of {second}
    </div>
</div>
