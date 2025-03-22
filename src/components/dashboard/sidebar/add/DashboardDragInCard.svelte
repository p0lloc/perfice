<script lang="ts">
    import {onMount} from "svelte";
    import {GridStack} from "gridstack";
    import {
        type DashboardWidgetDefinition,
        DashboardWidgetType
    } from "@perfice/model/dashboard/dashboard";

    let element: HTMLElement;
    let {definition, onClick}: {
        definition: DashboardWidgetDefinition<DashboardWidgetType, any>,
        onClick: () => void
    } = $props();

    function onKeyDown(e: KeyboardEvent) {
        if (e.key != "Enter") return;

        onClick();
    }

    onMount(() => {
        GridStack.setupDragIn([element], {
            appendTo: "body",
        });
    });
</script>

<div
        class="grid-stack-item hover-feedback cursor-grab"
        onclick={onClick}
        tabindex="0"
        role="button"
        onkeydown={onKeyDown}
        data-widget-type={definition.getType()}
        bind:this={element}
>
    <div class="drag-card border flex-center bg-white w-full h-32">
        {definition.getType()}
    </div>
</div>
