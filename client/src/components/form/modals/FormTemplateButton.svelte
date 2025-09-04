<script lang="ts">
    import PopupIconButton from "@perfice/components/base/button/PopupIconButton.svelte";
    import {faBoltLightning, faPen, faPlus} from "@fortawesome/free-solid-svg-icons";
    import type {FormTemplate} from "@perfice/model/form/form";
    import ContextMenuButtons from "@perfice/components/base/contextMenu/ContextMenuButtons.svelte";
    import ContextMenu from "@perfice/components/base/contextMenu/ContextMenu.svelte";

    let {templates, onNew, onTemplateSelected, onEditTemplate}: {
        templates: FormTemplate[],
        onNew: () => void,
        onTemplateSelected: (template: FormTemplate) => void
        onEditTemplate: (template: FormTemplate) => void
    } = $props();

    let editContextMenu: ContextMenu;
    let buttonContainer: HTMLElement;


    function onEdit() {
        editContextMenu.openFromClick(buttonContainer, buttonContainer);
    }

    let buttons = $derived.by(() => {
        let base = [...templates.map(v => {
            return {
                name: v.name,
                icon: null,
                action: () => onTemplateSelected(v)
            }
        }),
        {name: "New template", icon: faPlus, separated: true, action: onNew}];

        // Only show edit button if there are templates to be edited
        if(templates.length > 0) {
            base.push({name: "Edit templates",
                icon: faPen, separated: false, action: onEdit});
        }

        return base;
    });

    let editTemplateButtons = $derived(templates.map(v => {
        return {
            name: v.name,
            icon: faPen,
            action: () => onEditTemplate(v)
        }
    }));
</script>

<div bind:this={buttonContainer}>
    <PopupIconButton icon={faBoltLightning} buttons={buttons}/>
</div>

<ContextMenu bind:this={editContextMenu}>
    <ContextMenuButtons buttons={editTemplateButtons}/>
</ContextMenu>
