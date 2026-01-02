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
        class="rounded-xl flex flex-col justify-center items-center w-full h-full bg-white dark:bg-gray-800 default-border"
>
    {#await $res}
        Please select a goal
    {:then value}
        <GoalCardBase goal={value.goal} value={value.value} streak={value.value.streak}>
        </GoalCardBase>
    {/await}
</div>
