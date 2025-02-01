<script lang="ts">
    import type {Goal} from "@perfice/model/goal/goal";
    import {onDestroy} from "svelte";
    import {disposeCachedStoreKey} from "@perfice/stores/cached";
    import {goalValue} from "@perfice/main";
    import {WeekStart} from "@perfice/model/variable/time/time";
    import GoalValueRenderer from "@perfice/components/goal/GoalValueRenderer.svelte";

    let {goal, date}: { goal: Goal, date: Date } = $props();
    let cardId = crypto.randomUUID();

    let res = $derived(goalValue(goal, date, WeekStart.MONDAY, cardId));

    onDestroy(() => disposeCachedStoreKey(cardId));
</script>

<div class="border p-4 rounded-xl">
    {goal.name}

    {#await $res}
        Loading...
    {:then value}
        <GoalValueRenderer {value} color="magenta"/>
    {/await}
</div>
