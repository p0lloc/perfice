<script lang="ts">
    import Button from "@perfice/components/base/button/Button.svelte";
    import ContextMenu from "@perfice/components/base/contextMenu/ContextMenu.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import ContextMenuButtons from "@perfice/components/base/contextMenu/ContextMenuButtons.svelte";
    import {faHashtag, faSquareRootVariable} from "@fortawesome/free-solid-svg-icons";

    let {onAdd}: { onAdd: (constant: boolean) => void } = $props();

    let contextMenu = $state<ContextMenu | undefined>();
    const GOAL_SOURCE_TYPES = [
        {
            name: "Dynamic value",
            icon: faSquareRootVariable,
            action: () => onAdd(false)
        },

        {
            name: "Constant",
            icon: faHashtag,
            action: () => onAdd(true)
        }
    ];
</script>

<Button onClick={(e) => contextMenu?.openFromClick(e, e.currentTarget, true)} color={ButtonColor.WHITE}>Add source</Button>
<ContextMenu bind:this={contextMenu}>
    <ContextMenuButtons buttons={GOAL_SOURCE_TYPES}/>
</ContextMenu>
