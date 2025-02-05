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
        <div class="flex gap-4 mt-4 flex-wrap">
            {#each value as goal(goal.id)}
                <GoalCard date={$goalDate} goal={goal}/>
            {/each}

            <GoalNewCard />
        </div>
    {/await}
</div>
