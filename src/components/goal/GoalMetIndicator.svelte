<script lang="ts">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    import {faCheck, faTimes} from "@fortawesome/free-solid-svg-icons";

    let {value}: { value: boolean } = $props();
</script>

{#if value}
    <Fa icon={faCheck} class="text-green-500"/>
{:else}
    <Fa icon={faTimes} class="text-red-500"/>
{/if}
