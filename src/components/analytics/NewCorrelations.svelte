<script lang="ts">
    import type {AnalyticsHistoryEntry} from "@perfice/services/analytics/history";
    import type {AnalyticsResult, DetailCorrelation} from "@perfice/stores/analytics/analytics";
    import CorrelationCard from "@perfice/components/analytics/details/CorrelationCard.svelte";
    import type {CorrelationResult} from "@perfice/services/analytics/analytics";
    import {convertResultKey} from "@perfice/services/analytics/display";
    import {formatDayDifference} from "@perfice/util/time/format";

    let {newCorrelations, result}: { newCorrelations: AnalyticsHistoryEntry[], result: AnalyticsResult } = $props();

    type NewCorrelation = DetailCorrelation & {
        timestamp: number;
    }

    function convertToDetail(key: string, correlationResult: CorrelationResult, timestamp: number): NewCorrelation {
        return {
            key,
            display: convertResultKey(key, correlationResult, result.forms, result.tags),
            value: correlationResult,
            timestamp
        };
    }

    let detailedCorrelations = $derived.by(() => {
        let out: NewCorrelation[] = [];
        for (let correlation of newCorrelations) {
            let data = result.correlations.get(correlation.key);
            if (data == null) continue;

            out.push(convertToDetail(correlation.key, data, correlation.timestamp));
        }

        return out;
    });
</script>

{#each detailedCorrelations as correlation}
    <div>
        <CorrelationCard fullBar={true} correlation={correlation}/>
        <span class="text-right text-sm text-gray-400 flex justify-end">{formatDayDifference(new Date(), new Date(correlation.timestamp))}</span>
    </div>
{/each}