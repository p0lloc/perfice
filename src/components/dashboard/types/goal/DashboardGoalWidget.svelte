<script lang="ts">
    import type {DashboardGoalWidgetSettings} from "@perfice/model/dashboard/widgets/goal";
    import GoalCardBase from "@perfice/components/goal/GoalCardBase.svelte";
    import {dashboardDate} from "@perfice/stores/dashboard/dashboard";
    import {goalWidget, weekStart} from "@perfice/stores";

    let {settings}: {
        settings: DashboardGoalWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void
    } = $props();

    let res = $derived(goalWidget(settings, $dashboardDate, $weekStart,
        settings.goalVariableId + ":" + settings.goalStreakVariableId));
</script>

<div
        class="border rounded-xl flex flex-col justify-center items-center w-full h-full bg-white"
>
    {#await $res}
        Please select a goal
    {:then value}
        <GoalCardBase goal={value.goal} value={value.value} streak={value.value.streak}>
        </GoalCardBase>
    {/await}
</div>
