<script lang="ts">
    import type {AnalyticsHistoryEntry} from "@perfice/services/analytics/history";
    import type {AnalyticsResult, DetailCorrelation} from "@perfice/stores/analytics/analytics";
    import CorrelationCard from "@perfice/components/analytics/details/CorrelationCard.svelte";
    import type {CorrelationResult} from "@perfice/services/analytics/analytics";
    import {convertResultKey} from "@perfice/services/analytics/display";

    let {newCorrelations, result}: { newCorrelations: AnalyticsHistoryEntry[], result: AnalyticsResult } = $props();

    function convertToDetail(key: string, correlationResult: CorrelationResult): DetailCorrelation {
        return {
            key,
            display: convertResultKey(key, correlationResult, result.forms, result.tags),
            value: correlationResult
        };
    }

    let detailedCorrelations = $derived.by(() => {
        let out: DetailCorrelation[] = [];
        for (let correlation of newCorrelations) {
            let data = result.correlations.get(correlation.key);
            if (data == null) continue;

            out.push(convertToDetail(correlation.key, data));
        }

        return out;
    });
</script>

<div class="md:w-72 flex flex-col gap-2 p-4 bg-white rounded-md border">
    <h2 class="text-xl">New correlations</h2>
    {#each detailedCorrelations as correlation}
        <div>
            <CorrelationCard fullBar={true} correlation={correlation}/>
        </div>
    {/each}
</div>