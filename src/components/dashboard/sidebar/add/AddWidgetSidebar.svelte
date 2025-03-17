<script lang="ts">
    import type {DashboardAddWidgetAction} from "@perfice/model/dashboard/ui";
    import {getDashboardWidgetDefinitions} from "@perfice/model/dashboard/dashboard";
    import DashboardDragInCard from "@perfice/components/dashboard/sidebar/add/DashboardDragInCard.svelte";

    let {action}: { action: DashboardAddWidgetAction } = $props();

    let definitions = getDashboardWidgetDefinitions();
</script>


<div class="grid grid-cols-2 gap-2">
    {#each definitions as definition}
        <DashboardDragInCard {definition}/>
    {/each}
</div>