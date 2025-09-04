<script lang="ts">
    import type {Snippet} from "svelte";

    let {children}: { children: Snippet } = $props();
</script>

<div class="grid grid-cols-2">
    {@render children()}
</div>

<style>
    .side {
        width: 100%;
    }

    @media (min-width: 1200px) {
        .side {
            width: 48%;
        }
    }
</style>
