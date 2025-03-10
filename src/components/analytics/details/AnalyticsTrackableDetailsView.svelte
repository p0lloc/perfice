<script lang="ts">
    import {faArrowDown, faArrowUp} from "@fortawesome/free-solid-svg-icons";
    import CardButton from "@perfice/components/base/button/CardButton.svelte";
    import LineChart from "@perfice/components/chart/LineChart.svelte";
    import PieChart from "@perfice/components/chart/PieChart.svelte";
    import BarChart from "@perfice/components/chart/BarChart.svelte";
    import CorrelationBar from "@perfice/components/analytics/details/CorrelationBar.svelte";
    import {trackableDetailedAnalytics} from "@perfice/main";
    import {
        AnalyticsChartType,
        type TrackableDetailedAnalyticsResult,
    } from "@perfice/stores/analytics/trackable";
    import type {Readable} from "svelte/store";
    import {WEEK_DAYS_SHORT} from "@perfice/util/time/format";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import TitledCard from "@perfice/components/base/card/TitledCard.svelte";
    import BasicQuantitativeAnalyticsRow
        from "@perfice/components/analytics/details/BasicQuantitativeAnalyticsRow.svelte";
    import BasicCategoricalAnalyticsRow
        from "@perfice/components/analytics/details/BasicCategoricalAnalyticsRow.svelte";

    let {id}: { id: string } = $props();
    let res = $state<Readable<Promise<TrackableDetailedAnalyticsResult>>>(
        trackableDetailedAnalytics(id, null),
    );

    function onQuestionIdChange(questionId: string) {
        res = trackableDetailedAnalytics(id, questionId);
    }
</script>

{#await $res}
    Loading
{:then val}
    <div class="mt-8 flex justify-end">
        <BindableDropdownButton
                value={val.questionId}
                onChange={onQuestionIdChange}
                items={val.questions.map((q) => {
                return {
                    value: q.id,
                    name: q.name,
                };
            })}
        />
    </div>
    <div class="flex gap-4 items-center mt-4">
        {#if val.basicAnalytics.quantitative}
            <BasicQuantitativeAnalyticsRow analytics={val.basicAnalytics.value}/>
        {:else}
            <BasicCategoricalAnalyticsRow analytics={val.basicAnalytics.value}/>
        {/if}
    </div>

    <div class="bg-white rounded-xl p-2 border mt-4">
        {#if val.chart.type === AnalyticsChartType.LINE}
            {#if val.chart.values.length < 3}
                <p>Not enough data to show chart</p>
            {:else}
                <div class="h-48">
                    <LineChart
                            hideLabels={true}
                            hideGrid={true}
                            minimal={false}
                            dataPoints={val.chart.values}
                            labels={val.chart.labels}
                    />
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
    <div class="grid-cols-2 grid mt-8 gap-6">
        <div>
            <h3 class="text-3xl font-bold">Correlations</h3>
            <div class="flex-col gap-2 flex mt-4">
                {#each val.correlations as correlation (correlation.key)}
                    <div class="bg-white rounded border p-2">
                        <p class="mb-2">{correlation.name}</p>
                        <CorrelationBar
                                coefficient={correlation.value.coefficient}
                        />
                        <div class="flex justify-end text-gray-400 font-bold">
                            {Math.round(correlation.value.coefficient * 100)}%
                        </div>
                    </div>
                {:else}
                    <p>There are not any confident correlations.</p>
                {/each}
            </div>
        </div>
        <div>
            <h3 class="text-3xl font-bold">Week days</h3>
            {#if val.weekDayAnalytics.quantitative}
                <p>
                    Highest on {WEEK_DAYS_SHORT[
                    val.weekDayAnalytics.value.max
                    ]}, lowest on {WEEK_DAYS_SHORT[
                    val.weekDayAnalytics.value.min
                    ]}
                </p>
                <div class="h-56 mt-2">
                    <BarChart
                            hideLabels={true}
                            hideGrid={true}
                            minimal={false}
                            dataPoints={val.weekDayAnalytics.value.values}
                    />
                </div>
            {:else}
                {#each val.weekDayAnalytics.value.values.entries() as [weekDay, category]}
                    {#if category != null}
                        <p>
                            {category.category} is the most common ({category.frequency})
                            on {WEEK_DAYS_SHORT[weekDay]}
                        </p>
                    {/if}
                {/each}
            {/if}
        </div>
    </div>
{/await}
