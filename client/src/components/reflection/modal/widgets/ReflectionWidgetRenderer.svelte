<script lang="ts">

    import {
        type ReflectionWidget,
        type ReflectionWidgetAnswerState,
        ReflectionWidgetType
    } from "@perfice/model/reflection/reflection";
    import type {Component} from "svelte";
    import ReflectionFormWidget from "@perfice/components/reflection/modal/widgets/ReflectionFormWidget.svelte";
    import ReflectionTagsWidget from "@perfice/components/reflection/modal/widgets/ReflectionTagsWidget.svelte";
    import ReflectionTableWidget from "@perfice/components/reflection/modal/widgets/ReflectionTableWidget.svelte";
    import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
    import ReflectionChecklistWidget
        from "@perfice/components/reflection/modal/widgets/ReflectionChecklistWidget.svelte";
    import type {SimpleTimeScopeType} from "@perfice/model/variable/time/time";

    let {widget, states, onChange, openNestedForm}: {
        widget: ReflectionWidget,
        states: Record<string, ReflectionWidgetAnswerState>, onChange: (state: any) => void,
        openNestedForm: (formId: string,
                         onLog: (answers: Record<string, PrimitiveValue>, timestamp: number) => void,
                         timeScope: SimpleTimeScopeType,
                         answers?: Record<string, PrimitiveValue>) => void
    } = $props();

    let renderer: any;

    export function validate(): boolean {
        return renderer.validate();
    }

    const RENDERERS: Record<ReflectionWidgetType, Component<{
        settings: any,
        state: any,
        dependencies: Record<string, string>,
        onChange: (state: any) => void,
        openNestedForm: (formId: string,
                         onLog: (answers: Record<string, PrimitiveValue>, timestamp: number) => void,
                         timeScope: SimpleTimeScopeType,
                         answers?: Record<string, PrimitiveValue>) => void
    }>> = {
        [ReflectionWidgetType.FORM]: ReflectionFormWidget,
        [ReflectionWidgetType.TAGS]: ReflectionTagsWidget,
        [ReflectionWidgetType.TABLE]: ReflectionTableWidget,
        [ReflectionWidgetType.CHECKLIST]: ReflectionChecklistWidget,
    }

    const RendererComponent = $derived(RENDERERS[widget.type]);
</script>

<div>
    <RendererComponent settings={widget.settings} state={states[widget.id].state} bind:this={renderer} {onChange}
                       dependencies={widget.dependencies} {openNestedForm}/>
</div>