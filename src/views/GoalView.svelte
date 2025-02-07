<script lang="ts">
    import {goals, goalDate} from "@perfice/main";
    import GoalCard from "@perfice/components/goal/GoalCard.svelte";
    import TitleAndCalendar from "@perfice/components/base/title/TitleAndCalendar.svelte";
    import GoalNewCard from "@perfice/components/goal/GoalNewCard.svelte";
    import {onMount} from "svelte";
    function onDateChange(e: Date) {
        $goalDate = e;
    }

    onMount(() => {
        goals.load();
    })
</script>

<div class="md:w-1/2 mx-auto mt-8 md:p-0 p-2">
    <TitleAndCalendar date={$goalDate} onDateChange={onDateChange} title="Goals"/>
    {#await $goals}
        Loading...
    {:then value}
        <div class="w-full mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {#each value as goal(goal.id)}
                <GoalCard date={$goalDate} goal={goal}/>
            {/each}

            <GoalNewCard />
        </div>
    {/await}
</div>
