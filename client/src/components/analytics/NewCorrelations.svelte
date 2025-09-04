<script lang="ts">
    import type {AnalyticsHistoryEntry} from "@perfice/services/analytics/history";
    import type {AnalyticsResult, DetailCorrelation} from "@perfice/stores/analytics/analytics";
    import CorrelationCard from "@perfice/components/analytics/details/CorrelationCard.svelte";
    import type {CorrelationResult} from "@perfice/services/analytics/analytics";
    import {convertResultKey} from "@perfice/services/analytics/display";
    import {formatDayDifference} from "@perfice/util/time/format";
    import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
    import GenericEntityModal from "@perfice/components/base/modal/generic/GenericEntityModal.svelte";
    import {analytics} from "@perfice/stores";

    let {newCorrelations, result}: { newCorrelations: AnalyticsHistoryEntry[], result: AnalyticsResult } = $props();

    let ignoreConfirmationModal: GenericEntityModal<DetailCorrelation>;

    type NewCorrelation = DetailCorrelation & {
        timestamp: number;
    }

    function convertToDetail(key: string, correlationResult: CorrelationResult, timestamp: number): NewCorrelation {
        return {
            key,
            display: convertResultKey(key, correlationResult, SimpleTimeScopeType.DAILY, result.forms, result.tags),
            value: correlationResult,
            timestamp,
            timeScope: SimpleTimeScopeType.DAILY
        };
    }

    let detailedCorrelations = $derived.by(() => {
        let out: NewCorrelation[] = [];
        let daily = result.correlations.get(SimpleTimeScopeType.DAILY);
        if (daily == null) return out;
        for (let correlation of newCorrelations) {
            let data = daily.get(correlation.key);
            if (data == null) continue;

            out.push(convertToDetail(correlation.key, data, correlation.timestamp));
        }

        return out;
    });


    function onCorrelationIgnored(correlation: DetailCorrelation) {
        analytics.ignoreCorrelation(correlation.timeScope, correlation.key);
    }
</script>

<GenericEntityModal message="Are you sure you want to hide this correlation?" title="Hide correlation"
                    onConfirm={onCorrelationIgnored}
                    bind:this={ignoreConfirmationModal}
                    confirmText="Hide"/>
{#each detailedCorrelations as correlation}
    <div>
        <CorrelationCard onIgnore={() => ignoreConfirmationModal.open(correlation)} fullBar={true}
                         correlation={correlation}/>
        <span class="text-right text-sm text-gray-400 flex justify-end">{formatDayDifference(new Date(), new Date(correlation.timestamp))}</span>
    </div>
{:else}
    <p>There are no correlations yet, try adding more data.</p>
{/each}