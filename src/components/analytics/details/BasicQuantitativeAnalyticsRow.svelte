<script lang="ts">
    import type {QuantitativeBasicAnalytics} from "@perfice/services/analytics/analytics";
    import {faArrowDown, faArrowUp} from "@fortawesome/free-solid-svg-icons";
    import TitledCard from "@perfice/components/base/card/TitledCard.svelte";
    import CardButton from "@perfice/components/base/button/CardButton.svelte";
    import {formatTimestampYYYYMMDD, MONTHS_SHORT} from "@perfice/util/time/format.js";
    import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
    import {formatSimpleTimestamp} from "@perfice/model/variable/ui";

    let {analytics, timeScope}: { analytics: QuantitativeBasicAnalytics, timeScope: SimpleTimeScopeType } = $props();

    // TODO: link to journal with filtered entries
    function showMax() {
    }

    function showMin() {
    }

</script>

<TitledCard
        class=""
        title="Avg"
        icon={faArrowDown}
        description={analytics.average.toString()}
>
</TitledCard>

{#snippet suffix(timestamp = 0)}
        <span class="text-xs text-gray-400">
            {formatSimpleTimestamp(timestamp, timeScope)}
        </span>
{/snippet}

<CardButton
        class="rounded-xl"
        title="Max"
        onClick={showMax}
        icon={faArrowUp}
        description={analytics.max.value.toString()}
>
    {#snippet cardSuffix()}
        {@render suffix(analytics.max.timestamp)}
    {/snippet}
</CardButton>
<CardButton
        class="rounded-xl"
        title="Min"
        onClick={showMin}
        icon={faArrowDown}
        description={analytics.min.value.toString()}
>
    {#snippet cardSuffix()}
        {@render suffix(analytics.min.timestamp)}
    {/snippet}
</CardButton>

