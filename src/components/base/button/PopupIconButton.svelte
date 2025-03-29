<script lang="ts">
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {faEllipsisV, type IconDefinition} from "@fortawesome/free-solid-svg-icons";
    import ContextMenuButtons from "@perfice/components/base/contextMenu/ContextMenuButtons.svelte";
    import ContextMenu from "@perfice/components/base/contextMenu/ContextMenu.svelte";
    import type {ContextMenuButton} from "@perfice/model/ui/context-menu";

    let contextMenu: ContextMenu;

    let {icon = faEllipsisV, buttons, class: className = ""}: {
        icon?: IconDefinition,
        buttons: ContextMenuButton[],
        class?: string
    } = $props();

    function onClick(e: MouseEvent & { currentTarget: HTMLButtonElement }) {
        contextMenu.openFromClick(e.target as HTMLElement, e.currentTarget);
    }
</script>
<IconButton onClick={onClick} {icon} class={className}/>

<ContextMenu bind:this={contextMenu}>
    <ContextMenuButtons buttons={buttons}/>
</ContextMenu>
