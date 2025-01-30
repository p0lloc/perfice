<script lang="ts">
    import {onDestroy, type Snippet} from "svelte";
    import {openContextMenu, removeContextMenuCallback} from "@perfice/model/ui/context-menu";

    let {children}: { children: Snippet } = $props();

    let inLayout = $state(false);
    let visible = $state(false);
    let top = $state(0);
    let left = $state(0);
    let minWidth = $state("auto");

    let container: HTMLDivElement | undefined = $state();

    export function openFromClick(e: MouseEvent, initiator: HTMLElement, useParentWidth: boolean = false) {
        let target = e.target as HTMLElement;
        let rect = target.getBoundingClientRect();
        if (useParentWidth)
            minWidth = `${rect.width}px`;

        setTimeout(() => openAtPosition(rect.x + rect.width, rect.y + rect.height, initiator, rect.x, rect.y));
    }

    export function openAtPosition(x: number, y: number, initiator: HTMLElement, relativeX: number, _relativeY: number) {
        openContextMenu(close, initiator);
        inLayout = true;
        top = y;
        left = x;

        setTimeout(() => {
            if(container == null) return;
            let selfRect = container.getBoundingClientRect();
            // Make sure we aren't rendering outside the screen on the left
            // If we are, render on the left of the relative element
            if (left - selfRect.width >= 0) {
                left -= selfRect.width;
            } else {
                left = relativeX;
            }
            visible = true;
        });
    }

    export function close() {
        inLayout = false;
        visible = false;
    }


    onDestroy(() => {
        removeContextMenuCallback(close);
    });
</script>

{#if inLayout}
    <div class:invisible={!visible} class="absolute z-50 border rounded-xl bg-white" style:top="{top}px"
         style:left="{left}px"
         style:min-width="{minWidth}"
         bind:this={container}>
        {@render children()}
    </div>
{/if}
