<script lang="ts">
    import {ellipsis} from "@perfice/services/analytics/display.js";

    let {message, children}: { message: string, children: () => any } = $props();

    let showFull = $state(false);
</script>

<button class="items-center gap-1 flex" title={message} onclick={() => showFull = !showFull}>
    <span class="w-4">
        {@render children()}
    </span>
    {#if showFull}
        {message}
    {:else}
        {ellipsis(message, 20)}
    {/if}
</button>

<style>
    button {
        @apply bg-gray-100 border rounded-md px-1;
    }
</style>
