<script lang="ts">
    import type {TrackableWeekDayAnalyticsTransformed} from "@perfice/stores/analytics/trackable";
    import {WEEK_DAYS_SHORT} from "@perfice/util/time/format";
    import SingleChart from "@perfice/components/chart/SingleChart.svelte";

    let {analytics}: { analytics: TrackableWeekDayAnalyticsTransformed } = $props();
</script>

<div>
    <h3 class="text-3xl font-bold">Week days</h3>
    {#if analytics.quantitative}
        <p>
            Highest on {WEEK_DAYS_SHORT[analytics.value.max]}, lowest on {WEEK_DAYS_SHORT[analytics.value.min]}
        </p>
        <div class="h-56 mt-2">
            <SingleChart
                    type="bar"
                    fillColor="#0ccf84"
                    borderColor="#0b9661"
                    legend={false}
                    minimal={false}
                    dataPoints={analytics.value.dataPoints}
                    labels={analytics.value.labels}
            />
        </div>
    {:else}
        {#each analytics.value.values.entries() as [weekDay, category]}
            {#if category != null}
                <p>
                    {category.category} is the most common ({category.frequency})
                    on {WEEK_DAYS_SHORT[weekDay]}
                </p>
            {/if}
        {/each}
    {/if}
</div>
