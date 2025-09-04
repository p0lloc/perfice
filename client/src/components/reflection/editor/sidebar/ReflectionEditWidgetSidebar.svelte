<script lang="ts">
    import type {ReflectionEditWidgetAction} from "@perfice/model/reflection/ui";
    import {ReflectionWidgetType} from "@perfice/model/reflection/reflection";
    import type {Component} from "svelte";
    import ReflectionEditFormWidget
        from "@perfice/components/reflection/editor/sidebar/widget/ReflectionEditFormWidget.svelte";
    import ReflectionEditTagsWidget
        from "@perfice/components/reflection/editor/sidebar/widget/ReflectionEditTagsWidget.svelte";
    import ReflectionEditTableWidget
        from "@perfice/components/reflection/editor/sidebar/widget/ReflectionEditTableWidget.svelte";
    import ReflectionEditChecklistWidget
        from "@perfice/components/reflection/editor/sidebar/widget/ReflectionEditChecklistWidget.svelte";
    import type {Form} from "@perfice/model/form/form";

    let {action}: { action: ReflectionEditWidgetAction } = $props();

    const RENDERERS: Record<ReflectionWidgetType, Component<{
        settings: any,
        forms: Form[],
        onChange: (settings: any) => void
    }>> = {
        [ReflectionWidgetType.FORM]: ReflectionEditFormWidget,
        [ReflectionWidgetType.TAGS]: ReflectionEditTagsWidget,
        [ReflectionWidgetType.TABLE]: ReflectionEditTableWidget,
        [ReflectionWidgetType.CHECKLIST]: ReflectionEditChecklistWidget,
    };

    function onSettingsChange(settings: any) {
        action.widget.settings = settings;
        action.onChange({
            ...action.widget,
            settings
        });
    }

    const RendererComponent = $derived(RENDERERS[action.widget.type]);
</script>

<RendererComponent forms={action.forms} settings={action.widget.settings} onChange={onSettingsChange}/>