<script lang="ts">
    import 'gridstack/dist/gridstack.min.css';
    import 'gridstack/dist/gridstack-extra.min.css';
    import '@perfice/gridstack-extra-columns.css';
    import {mount, onDestroy, onMount, unmount} from "svelte";
    import {GridStack, type GridStackNode} from "gridstack";
    import {
        type DashboardWidget,
        type DashboardWidgetDisplaySettings,
        DashboardWidgetType,
        getDashboardWidgetDefinition
    } from "@perfice/model/dashboard/dashboard";
    import DashboardWidgetRenderer from "@perfice/components/dashboard/DashboardWidgetRenderer.svelte";
    import type {DashboardWidgetRendererExports} from "@perfice/model/dashboard/ui";
    import type {PrimitiveValue} from "@perfice/model/primitive/primitive";

    let {edit, widgets, openFormModal, onWidgetSelect, onWidgetAdd, onWidgetDelete, onWidgetUpdate}: {
        edit: boolean,
        widgets: DashboardWidget[],
        openFormModal: (formId: string, answers?: Record<string, PrimitiveValue>) => void,
        onWidgetSelect: (widget: DashboardWidget) => void
        onWidgetDelete: (id: DashboardWidget) => void
        onWidgetAdd: (widget: DashboardWidgetType, display: DashboardWidgetDisplaySettings) => Promise<DashboardWidget>
        onWidgetUpdate: (widget: DashboardWidget) => void
    } = $props();

    let grid: GridStack;
    let mountedWidgets: Map<string, DashboardWidgetRendererExports> = new Map();

    let lastManipulationEvent = 0;

    export function removeWidget(widget: DashboardWidget) {
        let element = grid.getGridItems().find(i => i.dataset.widgetId == widget.id);
        if (element == undefined) return;

        let renderer = mountedWidgets.get(widget.id);
        if (renderer == undefined) return;

        unmount(renderer);
        mountedWidgets.delete(widget.id);
        grid.removeWidget(element);
    }

    export function updateWidget(widget: DashboardWidget) {
        let renderer = mountedWidgets.get(widget.id);
        if (renderer == undefined) return;

        widgets = widgets.map(v => v.id == widget.id ? widget : v);
        renderer.onWidgetUpdated(widget);
    }

    export function addWidget(widget: DashboardWidget) {
        let definition = getDashboardWidgetDefinition(widget.type);
        if (definition == undefined) return;

        let element = document.createElement("div");
        element.dataset.widgetId = widget.id;
        grid.el.appendChild(element);
        mountWidgetRenderer(element, widget);

        grid.makeWidget(element, {
            x: widget.display.x,
            y: widget.display.y,
            w: widget.display.width,
            h: widget.display.height,
            minH: definition.getMinHeight(),
            minW: definition.getMinWidth(),
        });
    }

    function parseRenderOptsFromGridElement(
        element: HTMLElement,
    ): DashboardWidgetDisplaySettings {
        return {
            x: parseInt(element.getAttribute("gs-x") ?? "0"),
            y: parseInt(element.getAttribute("gs-y") ?? "0"),
            width: parseInt(element.getAttribute("gs-w") ?? "0"),
            height: parseInt(element.getAttribute("gs-h") ?? "0"),
        };
    }

    function onGridMoveOrResize() {
        lastManipulationEvent = Date.now();
    }

    function onGridItemsChange(e: Event, items: GridStackNode[]) {
        // Only update if the event was triggered by a resize/drag event
        // This is to prevent the responsive layouting from messing up the grid
        if (Date.now() - lastManipulationEvent > 10) return;

        for (let item of items) {
            let element = item.el;
            if (element == null) continue;

            const widgetId = element.dataset.widgetId;
            const widget = widgets.find(w => w.id == widgetId);
            if (widget == undefined) return;

            onWidgetUpdate({
                ...widget,
                display: parseRenderOptsFromGridElement(element)
            });
        }
    }

    async function onGridItemAdded(_: Event, items: GridStackNode[]) {
        // This function will be called for ALL items added, even previous.
        for (const item of items) {
            const element = item.el;
            if (element == null) continue;

            let child = element.firstElementChild;
            // Only create widget if it is a new one
            if (child == null || !child.classList.contains("drag-card")) continue;

            let widgetType: DashboardWidgetType = element.dataset.widgetType as DashboardWidgetType;
            let widget: DashboardWidget = await onWidgetAdd(widgetType, parseRenderOptsFromGridElement(element));
            element.className = "grid-stack-item"; // Reset any drag card classes
            element.dataset.widgetId = widget.id;
            element.removeChild(child);

            widgets.push(widget);
            mountWidgetRenderer(element, widget);
        }
    }

    function mountWidgetRenderer(element: HTMLElement, widget: DashboardWidget) {
        let exports = mount(DashboardWidgetRenderer, {
            target: element, props: {
                widget,
                onClick: (widget) => onWidgetSelect(widget),
                onDelete: (widget) => onWidgetDelete(widget),
                openFormModal,
            },
        });

        mountedWidgets.set(widget.id, exports);
    }

    onMount(() => {
        const maxY = widgets
            .map(v => v.display.y + v.display.height)
            .reduce((max, obj) =>
                obj > max ? obj : max, 0);

        grid = GridStack.init({
            cellHeight: 25,
            acceptWidgets: true,
            minRow: maxY + 10,
            margin: 5,
            staticGrid: !edit,
            animate: false,

            float: true,
            columnOpts: {
                columnMax: 30,
                breakpoints: [
                    {
                        w: 768,
                        c: 2
                    }
                ]
            }
        });

        grid.on("added", onGridItemAdded);
        grid.on("dragstop resizestop", onGridMoveOrResize);
        grid.on("change", onGridItemsChange);

        widgets.forEach(w => addWidget(w));
    });

    $effect(() => {
        grid.setStatic(!edit)
    });

    onDestroy(() => {
        mountedWidgets.values().forEach(v => unmount(v));
    })
</script>

<div class="grid-stack min-h-[100vh]">
</div>


