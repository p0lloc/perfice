<script lang="ts">
    import type { Goal } from "@perfice/model/goal/goal";
    import { onDestroy } from "svelte";
    import { disposeCachedStoreKey } from "@perfice/stores/cached";
    import { goals, goalValue } from "@perfice/main";
    import { WeekStart } from "@perfice/model/variable/time/time";
    import GoalValueRenderer from "@perfice/components/goal/GoalValueRenderer.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {
        faCheck,
        faEllipsisV,
        faPen,
        faTrash,
    } from "@fortawesome/free-solid-svg-icons";
    import { goto } from "@mateothegreat/svelte5-router";
    import PopupIconButton from "@perfice/components/base/button/PopupIconButton.svelte";
    import type { ContextMenuButton } from "@perfice/model/ui/context-menu";
    import { areGoalConditionsMet } from "@perfice/services/goal/goal";
    import { formatTimeScopeType } from "@perfice/model/variable/ui.js";

    let { goal, date }: { goal: Goal; date: Date } = $props();
    let cardId = crypto.randomUUID();

    let res = $derived(goalValue(goal, date, WeekStart.MONDAY, cardId));

    function editGoal() {
        goto(`/goals/${goal.id}`);
    }

    async function deleteGoal() {
        if (goal == null) return;
        await goals.deleteGoalById(goal.id);
    }

    const EDIT_POPUP: ContextMenuButton[] = [
        { name: "Edit", action: editGoal, icon: faPen },
        { name: "Delete", action: deleteGoal, icon: faTrash },
    ];

    onDestroy(() => disposeCachedStoreKey(cardId));
</script>

<div
    class="border aspect-auto rounded-xl flex flex-col items-center min-h-48 max-h-48"
>
    {#await $res}
        Loading...
    {:then value}
        <div
            class="border-b w-full p-2 row-between rounded-t-xl font-bold text-gray-600"
        >
            <span class="flex items-center gap-3">
                {goal.name}

                {#if areGoalConditionsMet(value.results)}
                    <Fa icon={faCheck} class="text-green-500" />
                {/if}
            </span>
            <PopupIconButton buttons={EDIT_POPUP} icon={faEllipsisV} />
        </div>

        <GoalValueRenderer value={value.results} color={goal.color} />
        <div class="border-t w-full text-center text-gray-500">
            {formatTimeScopeType(value.timeScope)}
        </div>
    {/await}
</div>
