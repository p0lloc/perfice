<script lang="ts">

    import {
        type ReflectionWidget,
        type ReflectionWidgetAnswerState,
        ReflectionWidgetType
    } from "@perfice/model/reflection/reflection";
    import type {Component} from "svelte";
    import ReflectionFormWidget from "@perfice/components/reflection/modal/widgets/ReflectionFormWidget.svelte";
    import ReflectionTagsWidget from "@perfice/components/reflection/modal/widgets/ReflectionTagsWidget.svelte";

    let {widget, states, onChange}: {
        widget: ReflectionWidget,
        states: Record<string, ReflectionWidgetAnswerState>, onChange: (state: any) => void
    } = $props();

    let renderer: any;

    export function validate(): boolean {
        return renderer.validate();
    }

    const RENDERERS: Record<ReflectionWidgetType, Component<{
        settings: any,
        state: any,
        onChange: (state: ReflectionWidgetAnswerState) => void
    }>> = {
        [ReflectionWidgetType.FORM]: ReflectionFormWidget,
        [ReflectionWidgetType.TAGS]: ReflectionTagsWidget,
    }

    const RendererComponent = $derived(RENDERERS[widget.type]);
</script>

<div>
    <RendererComponent settings={widget.settings} state={states[widget.id].state} bind:this={renderer} {onChange}/>
</div>