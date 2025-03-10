<script lang="ts">
    import type {QuantitativeBasicAnalytics} from "@perfice/services/analytics/analytics";
    import {faArrowDown, faArrowUp} from "@fortawesome/free-solid-svg-icons";
    import TitledCard from "@perfice/components/base/card/TitledCard.svelte";
    import CardButton from "@perfice/components/base/button/CardButton.svelte";
    import {formatTimestampYYYYMMDD} from "@perfice/util/time/format.js";

    let {analytics}: { analytics: QuantitativeBasicAnalytics } = $props();

    // TODO: link to journal with filtered entries
    function showMax() {
    }

    function showMin() {
    }
</script>

<TitledCard
        class="flex-1"
        title="Avg"
        icon={faArrowDown}
        description={analytics.average.toString()}
>
</TitledCard>

{#snippet suffix(timestamp = 0)}
        <span class="text-xs text-gray-400">
            {formatTimestampYYYYMMDD(timestamp)}
        </span>
{/snippet}

<CardButton
        class="flex-1 rounded-xl"
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
        class="flex-1 rounded-xl"
        title="Min"
        onClick={showMin}
        icon={faArrowDown}
        description={analytics.min.value.toString()}
>
    {#snippet cardSuffix()}
        {@render suffix(analytics.min.timestamp)}
    {/snippet}
</CardButton>
