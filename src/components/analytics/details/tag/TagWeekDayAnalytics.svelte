<script lang="ts">
    import {WEEK_DAYS_SHORT} from "@perfice/util/time/format.js";
    import type {TagWeekDayAnalyticsTransformed} from "@perfice/stores/analytics/tags";
    import SingleChart from "@perfice/components/chart/SingleChart.svelte";

    let {analytics}: { analytics: TagWeekDayAnalyticsTransformed } = $props();
</script>

<div>
    <h3 class="text-3xl font-bold">Week days</h3>
    <p>
        Most tagged on {WEEK_DAYS_SHORT[analytics.max]}, least tagged on {WEEK_DAYS_SHORT[analytics.min]}
    </p>
    <div class="h-56 mt-2">
        <SingleChart
                type="bar"
                fillColor="#0ccf84"
                borderColor="#0b9661"
                legend={false}
                minimal={false}
                dataPoints={analytics.dataPoints}
                labels={analytics.labels}
        />
    </div>
</div>
