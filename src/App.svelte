<script lang="ts">
    import Trackables from "@perfice/views/Trackables.svelte";
    import {appReady} from "./main";
</script>

{#if $appReady}
    <Trackables/>
{/if}
