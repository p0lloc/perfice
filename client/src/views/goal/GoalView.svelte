<script lang="ts">
    import GoalCard from "@perfice/components/goal/GoalCard.svelte";
    import TitleAndCalendar from "@perfice/components/base/title/TitleAndCalendar.svelte";
    import GoalNewCard from "@perfice/components/goal/GoalNewCard.svelte";
    import {onMount} from "svelte";
    import {faBullseye} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import {dateToMidnight} from "@perfice/util/time/simple";
    import GenericDeleteModal from "@perfice/components/base/modal/generic/GenericDeleteModal.svelte";
    import type {Goal} from "@perfice/model/goal/goal";
    import {goalDate, goals} from "@perfice/stores";

    let deleteGoalModal: GenericDeleteModal<Goal>;

    function onDateChange(e: Date) {
        $goalDate = e;
    }

    function onGoalStartDelete(goal: Goal) {
        deleteGoalModal.open(goal);
    }

    async function onGoalDelete(goal: Goal) {
        if (goal == null) return;
        await goals.deleteGoalById(goal.id);
    }

    onMount(() => {
        goals.load();
    })

    goalDate.set(dateToMidnight(new Date()));
</script>


<GenericDeleteModal subject="this goal" onDelete={onGoalDelete} bind:this={deleteGoalModal}/>
<MobileTopBar title="Goals"/>
<div class="center-view md:mt-8 md:p-0 px-4 py-2 main-content">
    <TitleAndCalendar date={$goalDate} onDateChange={onDateChange} title="Goals" icon={faBullseye}/>
    {#await $goals}
        Loading...
    {:then value}
        <div class="w-full mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {#each value as goal(goal.id)}
                <GoalCard onDelete={() => onGoalStartDelete(goal)} date={$goalDate} goal={goal}/>
            {/each}

            <GoalNewCard/>
        </div>
    {/await}
</div>
