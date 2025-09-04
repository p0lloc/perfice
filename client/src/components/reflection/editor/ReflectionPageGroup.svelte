<script lang="ts">
    import {
        getReflectionWidgetDefinition,
        type ReflectionPage,
        type ReflectionWidget,
        ReflectionWidgetType,
    } from "@perfice/model/reflection/reflection";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {faGripVertical, faPen, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
    import GenericEditDeleteCard from "@perfice/components/base/card/GenericEditDeleteCard.svelte";
    import {deleteIdentifiedInArray} from "@perfice/util/array";
    import PopupIconButton from "@perfice/components/base/button/PopupIconButton.svelte";
    import {REFLECTION_WIDGET_TYPES} from "@perfice/model/reflection/ui";
    import {formatCapitalized} from "@perfice/model/variable/ui.js";
    import DragAndDropContainer from "@perfice/components/base/dnd/DragAndDropContainer.svelte";
    import {dragHandle} from "svelte-dnd-action";
    import Fa from "svelte-fa";

    let {page, onDelete, onEdit, onEditWidget}: {
        page: ReflectionPage,
        onDelete: () => void,
        onEdit: () => void,
        onEditWidget: (widget: ReflectionWidget) => void,
    } = $props();

    let dragContainer: DragAndDropContainer;

    function onAddWidget(type: ReflectionWidgetType) {
        let definition = getReflectionWidgetDefinition(type);
        if (definition == null) return;

        page.widgets.push({
            id: crypto.randomUUID(),
            type,
            dependencies: {},
            settings: definition.getDefaultSettings(),
        });
        dragContainer.invalidateItems();
    }

    function onDeleteWidget(widget: ReflectionWidget) {
        page.widgets = deleteIdentifiedInArray(page.widgets, widget.id);
        dragContainer.invalidateItems();
    }

    function onWidgetsReorder(widgets: ReflectionWidget[]) {
        if (page == undefined) return;
        page.widgets = widgets;
    }

    const ADD_BUTTONS = REFLECTION_WIDGET_TYPES.map(v => {
        return {
            name: v.name,
            icon: v.icon,
            action: () => onAddWidget(v.value)
        }
    });
</script>

<div>
    <div class="bg-green-500 text-white px-4 py-2 rounded-md row-between">
        <div class="row-gap">
            <span use:dragHandle aria-label="Drag handle for {page.name}">
                <Fa icon={faGripVertical}/>
            </span>
            <span class="font-bold">{page.name}</span></div>

        <div class="row-gap">
            <IconButton icon={faPen} onClick={onEdit} class="pointer-feedback:bg-green-600"/>
            <IconButton icon={faTrash} onClick={onDelete} class="pointer-feedback:bg-green-600"/>
            <PopupIconButton icon={faPlus} buttons={ADD_BUTTONS} class="pointer-feedback:bg-green-600"/>
        </div>
    </div>
    <DragAndDropContainer bind:this={dragContainer} zoneId="reflection-widgets" items={page.widgets}
                          class="ml-4 flex-col gap-2 mt-2 flex min-h-10"
                          onFinalize={onWidgetsReorder}>
        {#snippet item(widget)}
            <GenericEditDeleteCard icon={REFLECTION_WIDGET_TYPES.find(v => v.value === widget.type)?.icon}
                                   text={formatCapitalized(widget.type)} onDelete={() => onDeleteWidget(widget)}
                                   onEdit={() => onEditWidget(widget)}/>
        {/snippet}
    </DragAndDropContainer>
</div>