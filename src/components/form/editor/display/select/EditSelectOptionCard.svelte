<script lang="ts">
    import type {SelectOption} from "@perfice/model/form/display/select";
    import {faPen, faTrash} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import Icon from "@perfice/components/base/icon/Icon.svelte";

    let {option, onDelete, onEdit}: { option: SelectOption, onDelete: () => void, onEdit: () => void } = $props();
</script>

<div class="border p-2 rounded-xl flex justify-between items-center">
    <div class="row-gap">
        {#if option.icon != null}
            <Icon name={option.icon}/>
        {/if}

        {option.text}
    </div>
    <div class="row-gap">
        <IconButton icon={faPen} onClick={onEdit}/>
        <IconButton icon={faTrash} onClick={onDelete}/>
    </div>
</div>
