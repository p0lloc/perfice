<script lang="ts">
    import type {Trackable, TrackableValueSettings} from "@perfice/model/trackable/trackable";
    import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
    import {fetchTrackableGoalValue} from "@perfice/stores/trackable/value";
    import type {WeekStart} from "@perfice/model/variable/time/time";
    import GoalValueRenderer from "@perfice/components/goal/GoalValueRenderer.svelte";

    let {trackable, value, cardSettings, date, preview, weekStart}: {
        trackable: Trackable,
        value: PrimitiveValue,
        cardSettings: TrackableValueSettings,
        date: Date,
        preview: boolean,
        weekStart: WeekStart
    } = $props();

    let goalStatus = $derived(fetchTrackableGoalValue(trackable, date, weekStart))
</script>

{#await $goalStatus then val}
    {#if val != null}
        <GoalValueRenderer value={val.results} color={"red"}/>
    {:else}
        No goal set
    {/if}
{/await}
