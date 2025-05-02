<script lang="ts">
    import {analytics} from "@perfice/stores";
    import CorrelationCard from "@perfice/components/analytics/details/CorrelationCard.svelte";
    import {convertResultKey, type CorrelationDisplayPart} from "@perfice/services/analytics/display";
    import {type CorrelationResult, DatasetKeyType} from "@perfice/services/analytics/analytics";
    import type {DetailCorrelation} from "@perfice/stores/analytics/analytics";
    import type {Form} from "@perfice/model/form/form";
    import type {Tag} from "@perfice/model/tag/tag";
    import NewCorrelations from "@perfice/components/analytics/NewCorrelations.svelte";
    import type {SimpleTimeScopeType} from "@perfice/model/variable/time/time.js";
    import GenericEntityModal from "@perfice/components/base/modal/generic/GenericEntityModal.svelte";

    const KEY_FILTERS = [
        {
            keyType: DatasetKeyType.QUANTITATIVE,
            label: "Numerical",
        },
        {
            keyType: DatasetKeyType.CATEGORICAL,
            label: "Categorical",
        },
        {
            keyType: DatasetKeyType.TAG,
            label: "Tags",
        },
        {
            keyType: DatasetKeyType.WEEK_DAY,
            label: "Week day",
        }
    ]

    let keyFilter = $state({
        [DatasetKeyType.QUANTITATIVE]: true,
        [DatasetKeyType.CATEGORICAL]: true,
        [DatasetKeyType.TAG]: true,
        [DatasetKeyType.WEEK_DAY]: true,
    })

    let newCorrelations = $derived(analytics.getNewestCorrelations(5, new Date().getTime()));
    let ignoreConfirmationModal: GenericEntityModal<DetailCorrelation>;

    let confidence = $state(50);
    let search = $state('');

    function shouldIncludeCorrelation(correlation: CorrelationResult, filter: Record<DatasetKeyType, boolean>) {
        // If key type is true in filter, or the correlation simply doesn't include it
        return KEY_FILTERS.every(f => filter[f.keyType] || !correlationIncludesKeyType(correlation, f.keyType))
    }

    function correlationIncludesKeyType(correlation: CorrelationResult, keyType: DatasetKeyType): boolean {
        return correlation.firstKeyType == keyType || correlation.secondKeyType == keyType;
    }

    function onConfidenceChange(e: { currentTarget: HTMLInputElement }) {
        confidence = parseInt(e.currentTarget.value);
    }

    function searchDisplayPart(part: CorrelationDisplayPart, search: string): boolean {
        return part.msg.toLowerCase().includes(search.toLowerCase());
    }

    function getCorrelationsToShow(correlations: Map<SimpleTimeScopeType, Map<string, CorrelationResult>>, filter: Record<DatasetKeyType, boolean>, search: string, forms: Form[], tags: Tag[]): DetailCorrelation[] {
        let result: DetailCorrelation[] = [];
        for (let [timeScope, values] of correlations.entries()) {
            for (let [key, correlation] of values.entries()) {
                // Filter out correlations with low confidence
                if (Math.abs(correlation.coefficient) < (confidence / 100)) {
                    continue;
                }

                // Filter out correlations that don't match the key filter
                if (!shouldIncludeCorrelation(correlation, filter))
                    continue;

                // Search based on text in display value, any of them might match
                let display = convertResultKey(key, correlation, timeScope, forms, tags);
                if (!searchDisplayPart(display.first, search) && !searchDisplayPart(display.second, search))
                    continue;

                result.push({
                    key: key,
                    display: display,
                    value: correlation,
                    timeScope: timeScope
                });
            }
        }

        result.sort((a, b) => Math.abs(b.value.coefficient) - Math.abs(a.value.coefficient));
        return result;
    }

    function onCorrelationIgnored(correlation: DetailCorrelation) {
        analytics.ignoreCorrelation(correlation.timeScope, correlation.key);
    }
</script>

<GenericEntityModal title="Hide correlation" bind:this={ignoreConfirmationModal}
                    message="Are you sure you want to hide this correlation?"
                    confirmText="Hide" onConfirm={onCorrelationIgnored}
></GenericEntityModal>
<div class="row-gap justify-between flex-wrap mt-4 md:mt-0">
    <input class="md:w-auto w-full" type="text" placeholder="Search..." bind:value={search}>
    <div class="row-gap flex-wrap">
        {#each KEY_FILTERS as filter}
            <div class="setting">
                {filter.label}
                <input type="checkbox" bind:checked={keyFilter[filter.keyType]}>
            </div>
        {/each}

        <div class="setting">Confidence<input type="range" min="0" max="100" value={confidence}
                                              onchange={onConfidenceChange}></div>
    </div>
</div>
{#await $analytics}
    Loading...
{:then result}
    <div class="flex md:flex-row flex-col gap-4 mt-4 flex-wrap items-start">
        <div class="w-full md:w-auto">
            <div class="md:w-72 flex flex-col gap-2 p-3 bg-white rounded-md border">
                <h2 class="text-xl">New correlations</h2>
                <NewCorrelations {newCorrelations} result={result}/>
            </div>
        </div>
        <div class="grid-cols-1 md:grid-cols-4 grid gap-4 flex-1">
            {#each getCorrelationsToShow(result.correlations, keyFilter, search, result.forms, result.tags) as correlation}
                <CorrelationCard onIgnore={() => ignoreConfirmationModal.open(correlation)} {correlation}
                                 fullBar={true} colActions={true}/>
            {/each}
        </div>
    </div>
{/await}

<style>
    .setting {
        @apply flex items-center gap-2 px-2 py-1 border rounded bg-white;
    }
</style>