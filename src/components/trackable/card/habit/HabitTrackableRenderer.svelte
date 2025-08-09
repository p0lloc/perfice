<script lang="ts">
    import type {Trackable, TrackableHabitSettings} from "@perfice/model/trackable/trackable";
    import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
    import type {WeekStart} from "@perfice/model/variable/time/time";
    import GoalValueRenderer from "@perfice/components/goal/GoalValueRenderer.svelte";
    import type {GoalValueResult} from "@perfice/stores/goal/value";

    let {trackable, cardSettings, date, weekStart, goalResult}: {
        trackable: Trackable,
        value: PrimitiveValue,
        cardSettings: TrackableHabitSettings,
        date: Date,
        preview: boolean,
        weekStart: WeekStart,
        goalResult: GoalValueResult | null
    } = $props();
</script>

{#if goalResult != null}
    <GoalValueRenderer value={goalResult.results} color={cardSettings.color}/>
{:else}
    No goal set
{/if}
