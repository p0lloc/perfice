<script lang="ts">
    import type {Goal} from "@perfice/model/goal/goal";
    import {onDestroy} from "svelte";
    import {disposeCachedStoreKey} from "@perfice/stores/cached";
    import {WeekStart} from "@perfice/model/variable/time/time";
    import {faEllipsisV, faPen, faTrash,} from "@fortawesome/free-solid-svg-icons";
    import {goto} from "@mateothegreat/svelte5-router";
    import PopupIconButton from "@perfice/components/base/button/PopupIconButton.svelte";
    import type {ContextMenuButton} from "@perfice/model/ui/context-menu";
    import GoalCardBase from "@perfice/components/goal/GoalCardBase.svelte";
    import {goalValue} from "@perfice/stores";

    let {goal, date, onDelete}: { goal: Goal; date: Date, onDelete: () => void } = $props();
    let cardId = crypto.randomUUID();

    let res = $derived(goalValue(goal.variableId, date, WeekStart.MONDAY, cardId));

    function editGoal() {
        goto(`/goals/${goal.id}`);
    }


    const EDIT_POPUP: ContextMenuButton[] = [
        {name: "Edit", action: editGoal, icon: faPen},
        {name: "Delete", action: onDelete, icon: faTrash},
    ];

    onDestroy(() => disposeCachedStoreKey(cardId));
</script>

<div
        class="border aspect-auto rounded-xl flex flex-col items-center min-h-48 max-h-48 bg-white"
>
    {#await $res}
        Loading...
    {:then value}
        <GoalCardBase {goal} {value}>
            {#snippet suffix()}
                <PopupIconButton buttons={EDIT_POPUP} icon={faEllipsisV}/>
            {/snippet}
        </GoalCardBase>
    {/await}
</div>
