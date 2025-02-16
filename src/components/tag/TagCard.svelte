<script lang="ts">
    import TagButtonBase from "@perfice/components/tag/TagButtonBase.svelte";
    import type {Tag} from "@perfice/model/tag/tag";
    import {faPlus, faTimes} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {tag}: { tag: Tag } = $props();
    let checked = false;
</script>

<TagButtonBase {checked} onClick={() => {}}>
    {#if checked}
        <Fa icon={faTimes}/>
    {:else}
        <Fa icon={faPlus}/>
    {/if}
    {tag.name}
</TagButtonBase>
