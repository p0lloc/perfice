<script lang="ts">
    import type {QuantitativeBasicAnalytics} from "@perfice/services/analytics/analytics";
    import {faArrowDown, faArrowUp} from "@fortawesome/free-solid-svg-icons";
    import TitledCard from "@perfice/components/base/card/TitledCard.svelte";
    import CardButton from "@perfice/components/base/button/CardButton.svelte";
    import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
    import {formatSimpleTimestamp} from "@perfice/model/variable/ui";
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import {formatValueAsDataType} from "@perfice/model/form/data";

    let {analytics, timeScope, dataType}: {
        analytics: QuantitativeBasicAnalytics,
        timeScope: SimpleTimeScopeType,
        dataType: FormQuestionDataType
    } = $props();

    // TODO: link to journal with filtered entries
    function showMax() {
    }

    function showMin() {
    }

</script>

<TitledCard
        class="bg-white"
        title="Avg"
        icon={faArrowDown}
        description={formatValueAsDataType(analytics.average, dataType)}
>
</TitledCard>

{#snippet suffix(timestamp = 0)}
        <span class="text-xs text-gray-400">
            {formatSimpleTimestamp(timestamp, timeScope)}
        </span>
{/snippet}

<CardButton
        title="Max"
        onClick={showMax}
        icon={faArrowUp}
        description={formatValueAsDataType(analytics.max.value, dataType)}
>
    {#snippet cardSuffix()}
        {@render suffix(analytics.max.timestamp)}
    {/snippet}
</CardButton>
<CardButton
        title="Min"
        onClick={showMin}
        icon={faArrowDown}
        description={formatValueAsDataType(analytics.min.value, dataType)}
>
    {#snippet cardSuffix()}
        {@render suffix(analytics.min.timestamp)}
    {/snippet}
</CardButton>

