<script lang="ts">
    import type {DetailCorrelation} from "@perfice/stores/analytics/analytics";
    import CorrelationCard from "@perfice/components/analytics/details/CorrelationCard.svelte";
    import GenericEntityModal from "@perfice/components/base/modal/generic/GenericEntityModal.svelte";
    import {analytics} from "@perfice/stores";

    let ignoreConfirmationModal: GenericEntityModal<DetailCorrelation>;

    let {correlations}: { correlations: DetailCorrelation[] } = $props();

    function onCorrelationIgnored(correlation: DetailCorrelation) {
        analytics.ignoreCorrelation(correlation.timeScope, correlation.key);
    }
</script>

<GenericEntityModal message="Are you sure you want to hide this correlation?" title="Hide correlation"
                    onConfirm={onCorrelationIgnored}
                    bind:this={ignoreConfirmationModal}
                    confirmText="Hide"/>
<div>
    <h3 class="text-3xl font-bold">Correlations</h3>
    <div class="flex-col gap-2 flex mt-4">
        {#each correlations as correlation (correlation.key)}
            <CorrelationCard onIgnore={() => ignoreConfirmationModal.open(correlation)} correlation={correlation}/>
        {:else}
            <p>There are not any confident correlations.</p>
        {/each}
    </div>
</div>
