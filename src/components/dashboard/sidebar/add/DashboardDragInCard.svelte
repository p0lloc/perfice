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

    /*
    function createDummyWidget(): DashboardWidget {
        return {
            id: "",
            type: definition.getType(),
            display: {x: 0, y: 0, width: 0, height: 0},
            dashboardId: "",
            settings: {}
        } as DashboardWidget;
    }


    function transformDraggedElement(_: any) {
        const clonedElement = element.cloneNode(true) as HTMLElement;
        clonedElement.innerHTML = "";

        mount(DashboardWidgetRenderer, {
            target: clonedElement,
            props: {
                widget: createDummyWidget(),
                openFormModal: () => {
                },
                onClick: () => {
                },
                onDelete: () => {
                }
            },
        });

        //patchDimensions(element, 200, 125);
        return clonedElement;
    }

    function patchDimensions(element: HTMLElement, width: number, height: number) {
        element.style.width = width + "px";
        element.style.height = height + "px";
        setTimeout(() => {
            element.style.width = "auto";
            element.style.height = "auto";
        });
    }*/

    onMount(() => {
        GridStack.setupDragIn([element], {
            appendTo: "body",
            //helper: transformDraggedElement,
        });
    });
</script>

<div
        class="grid-stack-item hover-feedback cursor-grab"
        onclick={onClick}
        data-widget-type={definition.getType()}
        bind:this={element}
>
    <div class="drag-card border flex-center bg-white w-full h-32">
        {definition.getType()}
    </div>
</div>
