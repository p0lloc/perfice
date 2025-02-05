<script lang="ts">
    import {goals, goalDate} from "@perfice/main";
    import GoalCard from "@perfice/components/goal/GoalCard.svelte";
    import TitleAndCalendar from "@perfice/components/base/title/TitleAndCalendar.svelte";
    import GoalNewCard from "@perfice/components/goal/GoalNewCard.svelte";
    function onDateChange(e: Date) {
        $goalDate = e;
    }
</script>

<div class="w-1/2 mx-auto mt-8">
    <TitleAndCalendar date={$goalDate} onDateChange={onDateChange} title="Goals"/>
    {#await $goals}
        Loading...
    {:then value}
        <div class="flex gap-4 mt-4">
            {#each value as goal(goal.id)}
                <GoalCard date={$goalDate} goal={goal}/>
            {/each}

            <GoalNewCard />
        </div>
    {/await}
</div>
