<script lang="ts">
    import {faPen, faTrash, type IconDefinition} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import GenericActionsCard from "@perfice/components/base/card/GenericActionsCard.svelte";

    let {icon, text, onDelete, onEdit, dragHandle}: {
        icon?: IconDefinition,
        text: string,
        dragHandle?: boolean,
        onDelete: () => void,
        onEdit: () => void
    } = $props();
</script>

<GenericActionsCard {icon} {text} draggable={dragHandle}>
    {#snippet actions()}
        <IconButton icon={faPen} onClick={onEdit}/>
        <IconButton icon={faTrash} onClick={onDelete}/>
    {/snippet}
</GenericActionsCard>