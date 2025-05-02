<script lang="ts">
    import PieChart from "@perfice/components/chart/PieChart.svelte";
    import {AnalyticsChartType, type TrackableDetailedAnalyticsResult,} from "@perfice/stores/analytics/trackable";
    import type {Readable} from "svelte/store";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import BasicQuantitativeAnalyticsRow
        from "@perfice/components/analytics/details/trackable/BasicQuantitativeAnalyticsRow.svelte";
    import BasicCategoricalAnalyticsRow
        from "@perfice/components/analytics/details/trackable/BasicCategoricalAnalyticsRow.svelte";
    import SegmentedControl from "@perfice/components/base/segmented/SegmentedControl.svelte";
    import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
    import {SIMPLE_TIME_SCOPE_TYPES} from "@perfice/model/variable/ui";
    import TrackableWeekDayAnalytics
        from "@perfice/components/analytics/details/trackable/TrackableWeekDayAnalytics.svelte";
    import CorrelationAnalytics from "@perfice/components/analytics/details/CorrelationAnalytics.svelte";
    import type {FormQuestion} from "@perfice/model/form/form";
    import type {DropdownMenuItem} from "@perfice/model/ui/dropdown";
    import {faRuler} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import AnalyticsTrackableLineChart
        from "@perfice/components/analytics/trackable/AnalyticsTrackableLineChart.svelte";
    import {trackableDetailedAnalytics} from "@perfice/stores";

    let {id}: { id: string } = $props();
    let res = $state<Readable<Promise<TrackableDetailedAnalyticsResult>>>(
        trackableDetailedAnalytics(id, null, SimpleTimeScopeType.DAILY),
    );

    function onQuestionIdChange(questionId: string, timeScope: SimpleTimeScopeType) {
        res = trackableDetailedAnalytics(id, questionId, timeScope);
    }

    function onTimeScopeChange(questionId: string, timeScope: SimpleTimeScopeType) {
        res = trackableDetailedAnalytics(id, questionId, timeScope);
    }

    function questionDropdownItems(questions: FormQuestion[]): DropdownMenuItem<string>[] {
        return questions.map((q) => {
            return {
                value: q.id,
                name: q.name,
            };
        })
    }
</script>

{#await $res}
    There is not enough data to provide analytics for this trackable.
{:then val}
    <h3 class="text-3xl md:text-4xl font-bold mt-2 md:mt-8 row-gap">
        <Fa icon={faRuler}/>
        {val.trackable.name}
    </h3>
    <div class="mt-4 md:mt-8 flex justify-between gap-2 flex-wrap">
        <SegmentedControl
                class="w-full md:w-auto"
                value={val.timeScope}
                onChange={(v) => onTimeScopeChange(val.questionId, v)}
                segments={SIMPLE_TIME_SCOPE_TYPES.filter(v => v.value !== SimpleTimeScopeType.YEARLY)}
        />
        <BindableDropdownButton
                class="w-full md:w-auto"
                value={val.questionId}
                onChange={(v) => onQuestionIdChange(v, val.timeScope)}
                items={questionDropdownItems(val.questions)}
        />
    </div>
    <div class="grid grid-cols-1 gap-4 items-center mt-4 flex-wrap"
         class:md:grid-cols-3={val.basicAnalytics.quantitative}
         class:md:grid-cols-2={!val.basicAnalytics.quantitative}
    >
        {#if val.basicAnalytics.quantitative}
            <BasicQuantitativeAnalyticsRow dataType={val.questionType}
                                           timeScope={val.timeScope} analytics={val.basicAnalytics.value}/>
        {:else}
            <BasicCategoricalAnalyticsRow analytics={val.basicAnalytics.value}/>
        {/if}
    </div>

    <div class="bg-white rounded-xl p-2 border mt-4">
        {#if val.chart.type === AnalyticsChartType.LINE}
            {#if val.chart.values.length < 2}
                <p>Not enough data to show chart</p>
            {:else}
                <div class="h-48">
                    <AnalyticsTrackableLineChart name={val.trackable.name} data={val.chart}/>
                </div>
            {/if}
        {/if}

        {#if val.chart.type === AnalyticsChartType.PIE}
            <div class="h-48">
                <PieChart
                        hideLabels={true}
                        hideGrid={true}
                        dataPoints={val.chart.values}
                />
            </div>
        {/if}
    </div>
    <div class="md:grid-cols-{val.weekDayAnalytics != null ? 2 : 1} grid mt-8 gap-6">
        <CorrelationAnalytics correlations={val.correlations}/>
        {#if val.weekDayAnalytics != null}
            <TrackableWeekDayAnalytics analytics={val.weekDayAnalytics}/>
        {/if}
    </div>
{/await}
