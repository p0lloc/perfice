<script lang="ts">
    import {onMount} from "svelte";
    import {GridStack} from "gridstack";
    import {
        type DashboardWidgetDefinition,
        DashboardWidgetType
    } from "@perfice/model/dashboard/dashboard";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let element: HTMLElement;
    let {definition, onClick, mobile}: {
        definition: DashboardWidgetDefinition<DashboardWidgetType, any>,
        mobile: boolean,
        onClick: () => void
    } = $props();

    function onKeyDown(e: KeyboardEvent) {
        if (e.key != "Enter") return;

        onClick();
    }

    onMount(() => {
        if(mobile)
            return;

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
    <div class="drag-card border flex-col items-center justify-center flex gap-2 bg-white w-full h-32 rounded-xl">
        <Fa icon={definition.getIcon()} size="2.0x" />
        <span>{definition.getName()}</span>
    </div>
</div>
