<script lang="ts">
    import CorrelationBar from "@perfice/components/analytics/details/CorrelationBar.svelte";
    import type {DetailCorrelation} from "@perfice/stores/analytics/analytics";

    let {correlations}: { correlations: DetailCorrelation[] } = $props();
</script>
<div>
    <h3 class="text-3xl font-bold">Correlations</h3>
    <div class="flex-col gap-2 flex mt-4">
        {#each correlations as correlation (correlation.key)}
            <div class="bg-white rounded border p-2">
                <p class="mb-2">{correlation.name}</p>
                <CorrelationBar
                        coefficient={correlation.value.coefficient}
                />
                <div class="flex justify-end text-gray-400 font-bold">
                    {Math.round(correlation.value.coefficient * 100)}%
                </div>
            </div>
        {:else}
            <p>There are not any confident correlations.</p>
        {/each}
    </div>
</div>
