<script lang="ts">
    import type {DashboardAddWidgetAction} from "@perfice/model/dashboard/ui";
    import {getDashboardWidgetDefinitions} from "@perfice/model/dashboard/dashboard";
    import DashboardDragInCard from "@perfice/components/dashboard/sidebar/add/DashboardDragInCard.svelte";

    let {action}: { action: DashboardAddWidgetAction } = $props();

    let definitions = getDashboardWidgetDefinitions();
    let mobile = window.innerWidth < 768;
</script>

{#if mobile}
    <p class="text-sm mb-4">The new widget will be added to the bottom of the dashboard.</p>
{/if}

<div class="grid grid-cols-2 gap-2">
    {#each definitions as definition}
        <DashboardDragInCard {definition} {mobile} onClick={() => action.onClick(definition.getType(), mobile)}/>
    {/each}
</div>