<script lang="ts">
    import {faPen, faTrash, type IconDefinition} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {icon, text, onDelete, onEdit}: { icon?: IconDefinition, text: string, onDelete: () => void, onEdit: () => void } = $props();
</script>

<div class="border p-2 rounded-xl flex justify-between items-center">
    <div class="row-gap">
        {#if icon != null}
            <Fa icon={icon}/>
        {/if}

        {text}
    </div>
    <div class="row-gap">
        <IconButton icon={faPen} onClick={onEdit}/>
        <IconButton icon={faTrash} onClick={onDelete}/>
    </div>
</div>
