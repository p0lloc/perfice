<script lang="ts">
    import {goals, goalDate} from "@perfice/app";
    import GoalCard from "@perfice/components/goal/GoalCard.svelte";
    import TitleAndCalendar from "@perfice/components/base/title/TitleAndCalendar.svelte";
    import GoalNewCard from "@perfice/components/goal/GoalNewCard.svelte";
    import {onMount} from "svelte";
    import {faBars, faBullseye} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import {dateToMidnight} from "@perfice/util/time/simple";

    function onDateChange(e: Date) {
        $goalDate = e;
    }

    onMount(() => {
        goals.load();
    })

    goalDate.set(dateToMidnight(new Date()));
</script>


<MobileTopBar title="Goals">
    {#snippet leading()}
        <button class="icon-button" onclick={() => console.log("TODO")}>
            <Fa icon={faBars}/>
        </button>
    {/snippet}
</MobileTopBar>
<div class="md:w-1/2 mx-auto md:mt-8 md:p-0 p-2 main-content">
    <TitleAndCalendar date={$goalDate} onDateChange={onDateChange} title="Goals" icon={faBullseye}/>
    {#await $goals}
        Loading...
    {:then value}
        <div class="w-full mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {#each value as goal(goal.id)}
                <GoalCard date={$goalDate} goal={goal}/>
            {/each}

            <GoalNewCard/>
        </div>
    {/await}
</div>
