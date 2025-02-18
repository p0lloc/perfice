<script lang="ts">
    import PopupIconButton from "@perfice/components/base/button/PopupIconButton.svelte";
    import {faBoltLightning} from "@fortawesome/free-solid-svg-icons";
    import type {FormTemplate} from "@perfice/model/form/form";

    let {templates, onNew, onTemplateSelected}: {
        templates: FormTemplate[],
        onNew: () => void,
        onTemplateSelected: (template: FormTemplate) => void
    } = $props();

    let buttons = $derived([
        {name: "New template", icon: null, action: onNew},
        ...templates.map(v => {
        return {
            name: v.name,
            icon: null,
            action: () => onTemplateSelected(v)
        }
    })]);
</script>
<PopupIconButton icon={faBoltLightning} buttons={buttons}/>
