<script lang="ts">
    import type {DetailCorrelation} from "@perfice/stores/analytics/analytics";
    import CorrelationCard from "@perfice/components/analytics/details/CorrelationCard.svelte";

    let {correlations}: { correlations: DetailCorrelation[] } = $props();
</script>
<div>
    <h3 class="text-3xl font-bold">Correlations</h3>
    <div class="flex-col gap-2 flex mt-4">
        {#each correlations as correlation (correlation.key)}
            <CorrelationCard correlation={correlation}/>
        {:else}
            <p>There are not any confident correlations.</p>
        {/each}
    </div>
</div>
