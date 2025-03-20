<script lang="ts">
    import GoalValueRenderer from "@perfice/components/goal/GoalValueRenderer.svelte";
    import {areGoalConditionsMet} from "@perfice/services/goal/goal";
    import type {GoalValueResult} from "@perfice/stores/goal/value";
    import {faCheck} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {Goal} from "@perfice/model/goal/goal";
    import type {Snippet} from "svelte";
    import {formatTimeScopeType} from "@perfice/model/variable/ui";

    let {goal, value, suffix}: { goal: Goal; value: GoalValueResult, suffix?: Snippet } = $props();

</script>
<div
        class="border-b w-full p-2 row-between rounded-t-xl font-bold text-gray-600"
>
            <span class="flex items-center gap-3">
                {goal.name}

                {#if areGoalConditionsMet(value.results)}
                    <Fa icon={faCheck} class="text-green-500"/>
                {/if}
            </span>
    {@render suffix?.()}
</div>

<GoalValueRenderer value={value.results} color={goal.color}/>
<div class="border-t w-full text-center text-gray-500">
    {formatTimeScopeType(value.timeScope)}
</div>