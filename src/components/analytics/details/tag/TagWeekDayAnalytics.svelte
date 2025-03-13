<script lang="ts">
    import {WEEK_DAYS_SHORT} from "@perfice/util/time/format.js";
    import BarChart from "@perfice/components/chart/BarChart.svelte";
    import type {TagWeekDayAnalyticsTransformed} from "@perfice/stores/analytics/tags";

    let {analytics}: { analytics: TagWeekDayAnalyticsTransformed } = $props();
</script>

<div>
    <h3 class="text-3xl font-bold">Week days</h3>
    <p>
        Most tagged on {WEEK_DAYS_SHORT[analytics.max]}, least tagged on {WEEK_DAYS_SHORT[analytics.min]}
    </p>
    <div class="h-56 mt-2">
        <BarChart
                hideLabels={true}
                hideGrid={true}
                minimal={false}
                dataPoints={analytics.values}
        />
    </div>
</div>
