<script lang="ts">
    import Button from "@perfice/components/base/button/Button.svelte";
    import ContextMenu from "@perfice/components/base/contextMenu/ContextMenu.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import ContextMenuButtons from "@perfice/components/base/contextMenu/ContextMenuButtons.svelte";
    import type {ContextMenuButton} from "@perfice/model/ui/context-menu";
    import type {Snippet} from "svelte";

    let {class: className = '', items, children}: {
        class?: string,
        items: ContextMenuButton[],
        children: Snippet
    } = $props();

    let contextMenu = $state<ContextMenu | undefined>();

    function onClick(e: MouseEvent & { currentTarget: HTMLButtonElement }) {
        contextMenu?.openFromClick(e.target as HTMLElement, e.currentTarget, true);
    }
</script>

<Button class={className} onClick={(e) => onClick(e)} color={ButtonColor.WHITE}>
    {@render children()}
</Button>
<ContextMenu bind:this={contextMenu}>
    <ContextMenuButtons buttons={items}/>
</ContextMenu>
