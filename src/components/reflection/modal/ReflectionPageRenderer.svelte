<script lang="ts">
    import type {ReflectionPage, ReflectionWidgetAnswerState} from "@perfice/model/reflection/reflection";
    import Icon from "@perfice/components/base/icon/Icon.svelte";
    import ReflectionWidgetRenderer from "@perfice/components/reflection/modal/widgets/ReflectionWidgetRenderer.svelte";

    let {page, states, onStateChange}: {
        page: ReflectionPage,
        states: Record<string, ReflectionWidgetAnswerState>,
        onStateChange: (id: string, state: ReflectionWidgetAnswerState) => void
    } = $props();

    let widgetRenderers: Record<string, ReflectionWidgetRenderer> = $state({});

    export function validate(): boolean {
        return Object.values(widgetRenderers)
            .every(r => r == null || r.validate());
    }

</script>
<div class="h-96 overflow-y-scroll scrollbar-hide">
    <div class="flex justify-between ">
        <div class="flex-1">
            <div class="flex gap-3 items-center">
                <span class="w-14">
                    {#if page.icon != null}
                        <Icon name={page.icon} class="text-4xl text-green-500"/>
                    {/if}
                </span>
                <div><h2 class="text-2xl">{page.name}</h2>
                    {page.description}</div>
            </div>
        </div>
    </div>
    <hr class="mt-3 mb-6">

    <div class="flex flex-col gap-4">
        {#each page.widgets as widget(widget.id)}
            <ReflectionWidgetRenderer {widget}
                                      onChange={(state) => onStateChange(widget.id, {...states[widget.id], state})}
                                      {states}
                                      bind:this={widgetRenderers[widget.id]}/>
        {/each}
    </div>
</div>
