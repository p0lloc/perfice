<script lang="ts">
    import type {QuantitativeBasicAnalytics} from "@perfice/services/analytics/analytics";
    import {faArrowDown, faArrowUp} from "@fortawesome/free-solid-svg-icons";
    import TitledCard from "@perfice/components/base/card/TitledCard.svelte";
    import CardButton from "@perfice/components/base/button/CardButton.svelte";
    import {SimpleTimeScopeType, TimeRangeType} from "@perfice/model/variable/time/time";
    import {formatSimpleTimestamp} from "@perfice/model/variable/ui";
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import {formatValueAsDataType} from "@perfice/model/form/data";
    import {type SearchEntity, SearchEntityMode, SearchEntityType} from "@perfice/model/journal/search/search";
    import {gotoSearch} from "@perfice/stores/journal/search";
    import {addDaysDate, dateToMidnight} from "@perfice/util/time/simple.js";

    let {analytics, timeScope, dataType, clickable}: {
        analytics: QuantitativeBasicAnalytics,
        timeScope: SimpleTimeScopeType,
        dataType: FormQuestionDataType,
        clickable: boolean
    } = $props();

    function jumpToDate(timestamp: number) {
        let date = new Date(timestamp);
        let search: SearchEntity[] = [
            {
                id: crypto.randomUUID(),
                type: SearchEntityType.TRACKABLE,
                mode: SearchEntityMode.INCLUDE,
                value: {
                    filters: []
                }
            },
            {
                id: crypto.randomUUID(),
                type: SearchEntityType.TAG,
                mode: SearchEntityMode.INCLUDE,
                value: {
                    filters: []
                }
            },
            {
                id: crypto.randomUUID(),
                type: SearchEntityType.DATE,
                mode: SearchEntityMode.MUST_MATCH,
                value: {
                    range: {
                        type: TimeRangeType.BETWEEN,
                        lower: dateToMidnight(date).getTime(),
                        upper: addDaysDate(dateToMidnight(date), 1).getTime() - 1000
                    }
                }
            },
        ];

        gotoSearch(search);
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

{#snippet btn(title = "", icon = faArrowUp, value = {timestamp: 0, value: 0})}
    <CardButton
            {title}
            onClick={() => jumpToDate(value.timestamp)}
            icon={icon}
            cardClass={clickable ? "hover-feedback bg-white" : "bg-white"}
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