<script lang="ts">
    import {
        type ReflectionPage,
        type ReflectionWidget,
        ReflectionWidgetType,
        type ReflectionWidgetTypes
    } from "@perfice/model/reflection/reflection";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {faPen, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
    import GenericEditDeleteCard from "@perfice/components/base/card/GenericEditDeleteCard.svelte";
    import {deleteIdentifiedInArray} from "@perfice/util/array";
    import PopupIconButton from "@perfice/components/base/button/PopupIconButton.svelte";
    import {REFLECTION_WIDGET_TYPES} from "@perfice/model/reflection/ui";
    import {formatCapitalized} from "@perfice/model/variable/ui.js";

    let {page, onDelete, onEdit, onEditWidget}: {
        page: ReflectionPage,
        onDelete: () => void,
        onEdit: () => void,
        onEditWidget: (widget: ReflectionWidget) => void,
    } = $props();

    function onAddWidget(type: ReflectionWidgetType) {
        let typeAndSettings: ReflectionWidgetTypes | undefined;
        switch (type) {
            case ReflectionWidgetType.FORM: {
                typeAndSettings = {
                    type: ReflectionWidgetType.FORM,
                    settings: {
                        formId: ""
                    }
                };
                break;
            }
            case ReflectionWidgetType.TAGS: {
                typeAndSettings = {
                    type: ReflectionWidgetType.TAGS,
                    settings: {
                        categories: []
                    }
                };
                break;
            }
            case ReflectionWidgetType.TABLE: {
                typeAndSettings = {
                    type: ReflectionWidgetType.TABLE,
                    settings: {
                        formId: "",
                        prefix: [],
                        suffix: [],
                        groupBy: null
                    }
                };
                break;
            }
            case ReflectionWidgetType.CHECKLIST: {
                typeAndSettings = {
                    type: ReflectionWidgetType.CHECKLIST,
                    settings: {
                        conditions: []
                    }
                };
                break;
            }
        }

        if (typeAndSettings == undefined) return;

        page.widgets.push({
            id: crypto.randomUUID(),
            dependencies: {},
            ...typeAndSettings
        });
    }

    function onDeleteWidget(widget: ReflectionWidget) {
        page.widgets = deleteIdentifiedInArray(page.widgets, widget.id);
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
        <span class="font-bold">{page.name}</span>

        <div class="row-gap">
            <IconButton icon={faPen} onClick={onEdit} class="pointer-feedback:bg-green-600"/>
            <IconButton icon={faTrash} onClick={onDelete} class="pointer-feedback:bg-green-600"/>
            <PopupIconButton icon={faPlus} buttons={ADD_BUTTONS} class="pointer-feedback:bg-green-600"/>
        </div>
    </div>
    <div class="ml-4 flex-col gap-2 mt-2 flex">
        {#each page.widgets as widget(widget.id)}
            <GenericEditDeleteCard icon={REFLECTION_WIDGET_TYPES.find(v => v.value === widget.type)?.icon}
                                   text={formatCapitalized(widget.type)} onDelete={() => onDeleteWidget(widget)}
                                   onEdit={() => onEditWidget(widget)}/>
        {/each}
    </div>
</div>