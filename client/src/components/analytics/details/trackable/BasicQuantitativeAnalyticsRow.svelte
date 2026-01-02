<script lang="ts">
    import type { QuantitativeBasicAnalytics } from "@perfice/services/analytics/analytics";
    import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
    import TitledCard from "@perfice/components/base/card/TitledCard.svelte";
    import CardButton from "@perfice/components/base/button/CardButton.svelte";
    import { SimpleTimeScopeType } from "@perfice/model/variable/time/time";
    import { formatSimpleTimestamp } from "@perfice/model/variable/ui";
    import type { FormQuestionDataType } from "@perfice/model/form/form";
    import { formatValueAsDataType } from "@perfice/model/form/data";
    import {
        createJournalDateSearch,
        gotoJournalSearch,
    } from "@perfice/stores/journal/search";

    let {
        analytics,
        timeScope,
        dataType,
        clickable,
    }: {
        analytics: QuantitativeBasicAnalytics;
        timeScope: SimpleTimeScopeType;
        dataType: FormQuestionDataType;
        clickable: boolean;
    } = $props();

    function jumpToDate(timestamp: number) {
        let date = new Date(timestamp);
        gotoJournalSearch(createJournalDateSearch(date));
    }
</script>

<TitledCard
    title="Avg"
    icon={faArrowDown}
    description={formatValueAsDataType(analytics.average, dataType)}
></TitledCard>

{#snippet suffix(timestamp = 0)}
    <span class="text-xs text-gray-400">
        {formatSimpleTimestamp(timestamp, timeScope)}
    </span>
{/snippet}

{#snippet btn(title = "", icon = faArrowUp, value = { timestamp: 0, value: 0 })}
    <CardButton
        {title}
        onClick={() => jumpToDate(value.timestamp)}
        {icon}
        cardClass={clickable ? "hover-feedback card" : "card"}
        disabled={!clickable}
        description={formatValueAsDataType(value.value, dataType)}
    >
        {#snippet cardSuffix()}
            {@render suffix(value.timestamp)}
        {/snippet}
    </CardButton>
{/snippet}

{@render btn("Max", faArrowUp, analytics.max)}
{@render btn("Min", faArrowDown, analytics.min)}
