<script lang="ts">

    import {faFilter, faTrash} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import type {Snippet} from "svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {name, onDelete, children}: { name: string, onDelete: () => void, children: Snippet } = $props();

</script>

<div class="border">
    <div class="row-between px-4 py-2">
        <div class="row-gap flex-wrap">
            <Fa icon={faFilter}></Fa>
            {name}
            {@render children()}
        </div>
        <IconButton icon={faTrash} onClick={onDelete}/>
    </div>
</div>