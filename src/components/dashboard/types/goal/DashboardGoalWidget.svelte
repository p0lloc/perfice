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

    let res = $derived(goalWidget(settings, $dashboardDate, $weekStart, settings.goalVariableId));
</script>


<div
        class="border rounded-xl flex flex-col items-center w-full h-full bg-white"
>
    {#await $res}
        Loading...
    {:then value}
        <GoalCardBase goal={value.goal} value={value.value}>
        </GoalCardBase>
    {/await}
</div>
