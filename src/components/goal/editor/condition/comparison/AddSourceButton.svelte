<script lang="ts">
    import {faHashtag, faSquareRootVariable} from "@fortawesome/free-solid-svg-icons";
    import PopupContextMenuButton from "@perfice/components/base/contextMenu/PopupContextMenuButton.svelte";

    let {onAdd}: { onAdd: (constant: boolean) => void } = $props();

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

<PopupContextMenuButton items={GOAL_SOURCE_TYPES}>Add source</PopupContextMenuButton>
