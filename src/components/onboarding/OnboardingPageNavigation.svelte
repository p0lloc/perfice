<script lang="ts">
    import {faChevronRight, faRocket} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {navigate, page, max, onSkip}: {
        navigate: (page: number) => void,
        page: number,
        max: number,
        onSkip: () => void
    } = $props();
</script>

<div class="flex items-center justify-between mt-20">
    <button onclick={onSkip} class="text-xl text-gray-500">Skip</button>
    <div class="flex gap-1 md:gap-2">
        {#each Array(max) as _, i }
            <button aria-label="Page {i}"
                    class="{i === page ? 'bg-green-500': 'bg-gray-400'} rounded-full md:w-4 md:h-4 h-3 w-3"
                    onclick={() => navigate(i)}>
            </button>
        {/each}
    </div>
    <button class="bg-green-500 pointer-feedback:bg-green-600 md:w-12 md:h-12 w-10 h-10 flex gap-1 justify-center items-center
    rounded-full btn-size font-bold text-white text-xl"
            onclick={() => navigate(page + 1)}>
        {#if page !== max - 1}
            <Fa icon={faChevronRight}/>
        {:else}
            <Fa icon={faRocket}/>
        {/if}
    </button>
</div>

<style>
    .btn-size {
        @apply text-xl px-5 py-2;
    }
</style>