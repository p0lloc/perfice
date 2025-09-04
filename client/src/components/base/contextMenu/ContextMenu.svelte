<script lang="ts">
    import {onDestroy, type Snippet} from "svelte";
    import {openContextMenu, removeContextMenuCallback} from "@perfice/model/ui/context-menu";
    import Portal from "svelte-portal";

    let {children}: { children: Snippet } = $props();

    let inLayout = $state(false);
    let visible = $state(false);
    let top = $state(0);
    let left = $state(0);
    let minWidth = $state("auto");

    let container: HTMLDivElement | undefined = $state();

    export function openFromClick(target: HTMLElement, initiator: HTMLElement, useParentWidth: boolean = false, scrollTop: number = 0) {
        let rect = target.getBoundingClientRect();
        if (useParentWidth)
            minWidth = `${rect.width}px`;

        setTimeout(() => openAtPosition(rect.x + rect.width, rect.y + rect.height, initiator, rect.x, rect.y, scrollTop));
    }

    export function openAtPosition(x: number, y: number, initiator: HTMLElement, relativeX: number, _relativeY: number, scrollOffset: number) {
        openContextMenu(close, initiator);
        inLayout = true;
        top = y;
        left = x;

        setTimeout(() => {
            if (container == null) return;

            if (container.children.length > 0) {
                // Scroll the context menu to the selected offset
                container.children[0].scrollTop = scrollOffset;
            }

            let selfRect = container.getBoundingClientRect();

            // Make sure we aren't rendering outside the screen on the bottom
            if (selfRect.y + selfRect.height > window.innerHeight) {
                top = _relativeY - selfRect.height;
            }

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
    <Portal target="body">
        <div class:invisible={!visible} class="fixed z-[5000] border rounded-xl bg-white text-black font-normal"
             style:top="{top}px"
             style:left="{left}px"
             style:min-width="{minWidth}"
             bind:this={container}>
            {@render children()}
        </div>
    </Portal>
{/if}
