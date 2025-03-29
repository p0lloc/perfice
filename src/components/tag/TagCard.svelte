<script lang="ts">
    import TagButtonBase from "@perfice/components/tag/TagButtonBase.svelte";
    import {faPlus, faTimes} from "@fortawesome/free-solid-svg-icons";
    import type {Tag} from "@perfice/model/tag/tag";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {tag, checked, onClick}: { tag: Tag, checked: boolean, onClick: () => void } = $props();
</script>
<TagButtonBase {checked} {onClick}>
    <span class="text-ellipsis overflow-hidden">{tag.name}</span>
    <span class="w-2">
            {#if checked}
            <Fa icon={faTimes}/>
        {:else}
            <Fa icon={faPlus}/>
        {/if}
        </span>
</TagButtonBase>
