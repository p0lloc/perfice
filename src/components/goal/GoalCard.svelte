<script lang="ts">
    import type {Goal} from "@perfice/model/goal/goal";
    import {onDestroy} from "svelte";
    import {disposeCachedStoreKey} from "@perfice/stores/cached";
    import {goalValue} from "@perfice/main";
    import {WeekStart} from "@perfice/model/variable/time/time";
    import GoalValueRenderer from "@perfice/components/goal/GoalValueRenderer.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faCheck} from "@fortawesome/free-solid-svg-icons";
    import {goto} from "@mateothegreat/svelte5-router";

    let {goal, date}: { goal: Goal, date: Date } = $props();
    let cardId = crypto.randomUUID();

    let res = $derived(goalValue(goal, date, WeekStart.MONDAY, cardId));

    function editGoal() {
        goto(`/goals/${goal.id}`);
    }

    onDestroy(() => disposeCachedStoreKey(cardId));
</script>

<div class="border rounded-xl w-40 flex flex-col items-center">
    {#await $res}
        Loading...
    {:then value}
        <button class="border-b w-full p-2 hover-feedback row-between" onclick={editGoal}>
            {goal.name}
            <Fa icon={faCheck} class="text-green-500"/>
        </button>

        <GoalValueRenderer {value} color="magenta"/>
    {/await}
</div>
